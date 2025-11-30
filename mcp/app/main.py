import time

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .logger import configure_logging, get_logger
from .orchestrator import AgentOrchestrator
from .schemas import (
    InputSchemaResponse,
    JobStatus,
    JobStatusResponse,
    PaymentWebhook,
    ProvideInputRequest,
    SokosumiCapability,
    StartJobRequest,
    StartJobResponse,
)
from .sokosumi_client import SokosumiClient

configure_logging()
settings = get_settings()
logger = get_logger(__name__)
orchestrator = AgentOrchestrator()
sokosumi_client = SokosumiClient()

app = FastAPI(
    title="Masumi MCP Agent Orchestrator",
    version=settings.orchestrator_version,
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    capabilities = [
        SokosumiCapability(
            name="parking-research",
            description="Analyzes Masumi parking telemetry and Cardano receipts to find insights",
            inputs=["text", "parking_context"],
            outputs=["summary", "actions"],
        ),
        SokosumiCapability(
            name="cardano-payment-check",
            description="Validates Masumi payment receipts before handing work to downstream CrewAI agents",
            inputs=["identifier_from_purchaser"],
            outputs=["verification_status"],
        ),
    ]
    try:
        sokosumi_client.register_capabilities(capabilities)
    except Exception as exc:  # pragma: no cover - network side effect
        logger.warning("Unable to register Sokosumi capabilities on startup", exc_info=exc)


@app.get("/input_schema", response_model=InputSchemaResponse)
def get_input_schema() -> InputSchemaResponse:
    return orchestrator.input_schema()


@app.get("/availability")
def availability():
    return orchestrator.availability()


@app.post("/start_job", response_model=StartJobResponse)
def start_job(payload: StartJobRequest, background_tasks: BackgroundTasks) -> StartJobResponse:
    try:
        response = orchestrator.start_job(payload)
        # Auto-expire jobs if payment is not received within TTL
        background_tasks.add_task(_expire_job_if_unpaid, response.job_id)
        return response
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


def _expire_job_if_unpaid(job_id: str) -> None:
    time.sleep(settings.job_ttl_seconds)
    job = orchestrator._jobs.get_job(job_id)
    if job and job.status == JobStatus.awaiting_payment:
        orchestrator._jobs.update_job(job_id, status=JobStatus.cancelled, error="Payment timed out")
        sokosumi_client.heartbeat(JobStatus.cancelled, job_id, "Payment timed out")


@app.get("/status", response_model=JobStatusResponse)
def job_status(job_id: str) -> JobStatusResponse:
    try:
        return orchestrator.job_status(job_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Job not found")


@app.post("/provide_input", response_model=JobStatusResponse)
def provide_additional_input(payload: ProvideInputRequest) -> JobStatusResponse:
    job = orchestrator._jobs.get_job(payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    orchestrator._jobs.update_job(payload.job_id, result={**(job.result or {}), "additional_input": payload.input_data})
    return orchestrator.job_status(payload.job_id)


@app.post("/payment/webhook", response_model=JobStatusResponse)
def payment_webhook(payload: PaymentWebhook, background_tasks: BackgroundTasks) -> JobStatusResponse:
    try:
        status = orchestrator.handle_payment_webhook(payload)
    except KeyError:
        raise HTTPException(status_code=404, detail="Job not found")

    if status.status == JobStatus.running:
        background_tasks.add_task(orchestrator.execute_job, payload.job_id)
    return status


@app.get("/health")
def health() -> dict:
    availability = orchestrator.availability()
    return {
        "status": "ok" if availability.available else "degraded",
        "agent_identifier": settings.agent_identifier,
        "network": settings.network,
    }
