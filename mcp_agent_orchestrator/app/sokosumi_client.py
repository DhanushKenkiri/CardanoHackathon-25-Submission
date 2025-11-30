from typing import Any, Dict, Optional

import httpx

from .config import get_settings
from .schemas import JobStatus, SokosumiCapability, SokosumiHeartbeat
from .logger import get_logger

logger = get_logger(__name__)


class SokosumiClient:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client = httpx.Client(base_url=self._settings.sokosumi_base_url, timeout=30)

    def _headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self._settings.sokosumi_api_key}"}

    def heartbeat(self, status: JobStatus, job_id: Optional[str] = None, detail: Optional[str] = None) -> None:
        heartbeat = SokosumiHeartbeat(
            agent_identifier=self._settings.agent_identifier,
            job_id=job_id,
            status=status,
            detail=detail,
        )
        try:
            self._client.post("/agents/heartbeat", headers=self._headers(), json=heartbeat.model_dump())
        except httpx.HTTPError as exc:  # pragma: no cover - network dependent
            logger.warning("Failed to push Sokosumi heartbeat", exc_info=exc)

    def capabilities(self) -> Dict[str, Any]:
        response = self._client.get(f"/agents/{self._settings.agent_identifier}", headers=self._headers())
        response.raise_for_status()
        return response.json()

    def register_capabilities(self, capabilities: list[SokosumiCapability]) -> None:
        payload = {
            "agentIdentifier": self._settings.agent_identifier,
            "network": self._settings.network,
            "capabilities": [cap.model_dump() for cap in capabilities],
        }
        response = self._client.post("/agents/register", headers=self._headers(), json=payload)
        response.raise_for_status()
        logger.info("Sokosumi capabilities updated", extra={"count": len(capabilities)})

    def notify_job_event(self, job_id: str, status: JobStatus, result: Optional[Dict[str, Any]] = None) -> None:
        payload = {
            "agentIdentifier": self._settings.agent_identifier,
            "jobId": job_id,
            "status": status.value,
            "result": result or {},
        }
        try:
            self._client.post("/agents/job-event", headers=self._headers(), json=payload)
        except httpx.HTTPError as exc:  # pragma: no cover
            logger.warning("Unable to notify Sokosumi job event", exc_info=exc)

    def ensure_agent_is_live(self) -> bool:
        try:
            response = self._client.get(
                f"/agents/{self._settings.agent_identifier}/availability",
                headers=self._headers(),
            )
            response.raise_for_status()
            data = response.json()
            return data.get("available", False)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                logger.error("Agent not registered on Sokosumi testnet")
            else:
                logger.error("Sokosumi availability check failed", exc_info=exc)
            return False
        except httpx.HTTPError as exc:  # pragma: no cover
            logger.error("Sokosumi availability request encountered network error", exc_info=exc)
            return False
