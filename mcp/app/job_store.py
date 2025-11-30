from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from .config import get_settings
from .schemas import JobStatus
from .logger import get_logger


logger = get_logger(__name__)


@dataclass
class Job:
    job_id: str
    purchaser_identifier: str
    input_data: Dict[str, Any]
    status: JobStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        # dataclass -> isoformat for datetimes
        payload["started_at"] = self.started_at.isoformat()
        payload["updated_at"] = self.updated_at.isoformat()
        return payload

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Job":
        return cls(
            job_id=data["job_id"],
            purchaser_identifier=data["purchaser_identifier"],
            input_data=data["input_data"],
            status=JobStatus(data["status"]),
            result=data.get("result"),
            error=data.get("error"),
            started_at=datetime.fromisoformat(data["started_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
        )


class JobStore:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._jobs: Dict[str, Job] = {}
        self._redis = None
        if self._settings.redis_url:
            try:
                from redis import Redis

                self._redis = Redis.from_url(self._settings.redis_url, decode_responses=True)
                self._redis.ping()
                logger.info("Connected to Redis job store", extra={"url": self._settings.redis_url})
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning("Redis unavailable, falling back to in-memory store", exc_info=exc)
                self._redis = None

    def _persist(self, job: Job) -> None:
        job.updated_at = datetime.now(timezone.utc)
        if self._redis:
            self._redis.setex(job.job_id, self._settings.job_ttl_seconds, json.dumps(job.to_dict()))
        self._jobs[job.job_id] = job

    def create_job(self, purchaser_identifier: str, input_data: Dict[str, Any]) -> Job:
        job = Job(
            job_id=str(uuid.uuid4()),
            purchaser_identifier=purchaser_identifier,
            input_data=input_data,
            status=JobStatus.awaiting_payment,
        )
        self._persist(job)
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        if job_id in self._jobs:
            return self._jobs[job_id]
        if self._redis:
            raw = self._redis.get(job_id)
            if raw:
                job = Job.from_dict(json.loads(raw))
                self._jobs[job_id] = job
                return job
        return None

    def update_job(
        self,
        job_id: str,
        *,
        status: Optional[JobStatus] = None,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
    ) -> Job:
        job = self.get_job(job_id)
        if not job:
            raise KeyError(f"Job {job_id} not found")
        if status:
            job.status = status
        if result is not None:
            job.result = result
        if error is not None:
            job.error = error
        self._persist(job)
        return job

    def all_jobs(self) -> Dict[str, Job]:
        return self._jobs
