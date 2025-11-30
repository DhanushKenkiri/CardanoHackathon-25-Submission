from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    awaiting_payment = "awaiting_payment"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class InputSchemaResponse(BaseModel):
    input_schema: Dict[str, Any]


class AvailabilityResponse(BaseModel):
    available: bool
    reason: Optional[str] = None
    network: str
    agent_identifier: str


class StartJobRequest(BaseModel):
    identifier_from_purchaser: str = Field(..., min_length=6)
    input_data: Dict[str, Any]


class StartJobResponse(BaseModel):
    job_id: str
    payment_amount: int
    payment_unit: str
    status: JobStatus


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: datetime
    updated_at: datetime


class ProvideInputRequest(BaseModel):
    job_id: str
    input_data: Dict[str, Any]


class PaymentWebhook(BaseModel):
    job_id: str
    payment_reference: str
    status: JobStatus


class SokosumiHeartbeat(BaseModel):
    agent_identifier: str
    job_id: Optional[str] = None
    status: JobStatus
    detail: Optional[str] = None


class SokosumiCapability(BaseModel):
    name: str
    description: str
    inputs: List[str]
    outputs: List[str]
