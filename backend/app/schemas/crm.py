from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


CRMStatus = Literal["NEW", "CONTACTED", "REPLIED", "CLOSED"]


class CRMHistoryEntry(BaseModel):
    status: CRMStatus
    note: str | None = None
    at: datetime


class CRMRecord(BaseModel):
    lead_id: str
    status: CRMStatus
    note: str | None = None
    follow_up_at: datetime | None = None
    updated_at: datetime
    history: list[CRMHistoryEntry] = Field(default_factory=list)


class CRMUpdateRequest(BaseModel):
    status: CRMStatus
    note: str | None = Field(default=None, max_length=1000)
    follow_up_at: datetime | None = None
