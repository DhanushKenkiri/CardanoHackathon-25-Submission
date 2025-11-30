from __future__ import annotations

from typing import Any, Dict

from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import get_settings
from .job_store import JobStore
from .logger import get_logger
from .payment_client import PaymentClient
from .schemas import (
    AvailabilityResponse,
    InputSchemaResponse,
    JobStatus,
    JobStatusResponse,
    PaymentWebhook,
    StartJobRequest,
    StartJobResponse,
)
from .sokosumi_client import SokosumiClient

logger = get_logger(__name__)


class AgentOrchestrator:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._jobs = JobStore()
        self._payment = PaymentClient()
        self._sokosumi = SokosumiClient()
        self._openai = OpenAI(api_key=self._settings.openai_api_key)

    def input_schema(self) -> InputSchemaResponse:
        schema = {
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Topic or question to analyze"},
                "parking_context": {
                    "type": "object",
                    "description": "Optional Masumi parking telemetry",
                },
                "expected_outputs": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": ["text"],
        }
        return InputSchemaResponse(input_schema=schema)

    def availability(self) -> AvailabilityResponse:
        active_jobs = [job for job in self._jobs.all_jobs().values() if job.status in {JobStatus.awaiting_payment, JobStatus.running}]
        if len(active_jobs) >= self._settings.max_parallel_jobs:
            return AvailabilityResponse(
                available=False,
                reason="Parallel job limit reached",
                network=self._settings.network,
                agent_identifier=self._settings.agent_identifier,
            )

        if not self._payment.health():
            return AvailabilityResponse(
                available=False,
                reason="Payment node unreachable",
                network=self._settings.network,
                agent_identifier=self._settings.agent_identifier,
            )

        if not self._sokosumi.ensure_agent_is_live():
            return AvailabilityResponse(
                available=False,
                reason="Sokosumi agent not live",
                network=self._settings.network,
                agent_identifier=self._settings.agent_identifier,
            )

        return AvailabilityResponse(
            available=True,
            network=self._settings.network,
            agent_identifier=self._settings.agent_identifier,
        )

    def start_job(self, payload: StartJobRequest) -> StartJobResponse:
        availability = self.availability()
        if not availability.available:
            raise RuntimeError(availability.reason or "Agent unavailable")

        job = self._jobs.create_job(payload.identifier_from_purchaser, payload.input_data)
        logger.info("Job created", extra={"job_id": job.job_id})
        self._sokosumi.heartbeat(JobStatus.awaiting_payment, job.job_id, "Awaiting Masumi payment")

        return StartJobResponse(
            job_id=job.job_id,
            payment_amount=self._settings.payment_amount,
            payment_unit=self._settings.payment_unit,
            status=job.status,
        )

    def job_status(self, job_id: str) -> JobStatusResponse:
        job = self._jobs.get_job(job_id)
        if not job:
            raise KeyError(f"Job {job_id} not found")
        return JobStatusResponse(
            job_id=job.job_id,
            status=job.status,
            result=job.result,
            error=job.error,
            started_at=job.started_at,
            updated_at=job.updated_at,
        )

    def handle_payment_webhook(self, payload: PaymentWebhook) -> JobStatusResponse:
        job = self._jobs.get_job(payload.job_id)
        if not job:
            raise KeyError(f"Job {payload.job_id} not found")

        if payload.status != JobStatus.completed:
            logger.warning("Payment not completed", extra={"job_id": payload.job_id, "status": payload.status})
            self._jobs.update_job(payload.job_id, status=JobStatus.failed, error="Payment unsuccessful")
            return self.job_status(payload.job_id)

        self._jobs.update_job(payload.job_id, status=JobStatus.running)
        self._sokosumi.heartbeat(JobStatus.running, payload.job_id, "Payment received, executing job")
        return self.job_status(payload.job_id)

    def execute_job(self, job_id: str) -> None:
        job = self._jobs.get_job(job_id)
        if not job:
            return

        try:
            orchestration_result = self._run_orchestration(job.input_data)
            self._jobs.update_job(job_id, status=JobStatus.completed, result=orchestration_result)
            self._sokosumi.notify_job_event(job_id, JobStatus.completed, orchestration_result)
            self._sokosumi.heartbeat(JobStatus.completed, job_id, "Job finished successfully")
            logger.info("Job completed", extra={"job_id": job_id})
        except Exception as exc:  # pragma: no cover - depends on OpenAI runtime
            logger.error("Job failed", exc_info=exc)
            self._jobs.update_job(job_id, status=JobStatus.failed, error=str(exc))
            self._sokosumi.notify_job_event(job_id, JobStatus.failed, {"error": str(exc)})
            self._sokosumi.heartbeat(JobStatus.failed, job_id, "Job failed")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=1, max=8))
    def _run_orchestration(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        text = input_data.get("text", "")
        parking_context = input_data.get("parking_context")
        expected_outputs = input_data.get("expected_outputs", ["analysis", "actions"])

        system_prompt = (
            "You are the Masumi Orchestrator. Combine parking telemetry, payment data, and"
            " Sokosumi collaboration hooks to deliver concise instructions for downstream agents."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": (
                    f"Task: {text}\n" f"Parking context: {parking_context}\n"
                    f"Expected outputs: {', '.join(expected_outputs)}"
                ),
            },
        ]

        response = self._openai.chat.completions.create(
            model=self._settings.openai_model,
            messages=messages,
            temperature=0.2,
        )

        plan = response.choices[0].message.content
        return {
            "summary": plan,
            "inputs": input_data,
            "version": self._settings.orchestrator_version,
        }
