from typing import Any, Dict, Optional

import httpx

from .config import get_settings
from .logger import get_logger

logger = get_logger(__name__)


class PaymentClient:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client = httpx.Client(base_url=self._settings.payment_service_url, timeout=30)

    def _headers(self) -> Dict[str, str]:
        return {"token": self._settings.payment_api_key}

    def health(self) -> bool:
        try:
            response = self._client.get("/health/", headers=self._headers())
            response.raise_for_status()
            data = response.json()
            return data.get("data", {}).get("status") == "ok"
        except httpx.HTTPError as exc:  # pragma: no cover - depends on env
            logger.error("Payment service health check failed", exc_info=exc)
            return False

    def payment_source(self) -> Dict[str, Any]:
        response = self._client.get("/payment-source/", headers=self._headers())
        response.raise_for_status()
        return response.json()

    def request_purchase(self, *, agent_identifier: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        payload = {"agent_identifier": agent_identifier}
        if metadata:
            payload["metadata"] = metadata
        response = self._client.post("/purchase", headers=self._headers(), json=payload)
        response.raise_for_status()
        data = response.json()
        logger.info("Purchase initiated", extra={"agent": agent_identifier})
        return data
