from datetime import datetime

from pydantic import BaseModel, Field


class SendEmailRequest(BaseModel):
    to: str = Field(min_length=5, max_length=160)
    subject: str = Field(min_length=1, max_length=300)
    message: str = Field(min_length=1, max_length=2000)
    lead_id: str = Field(min_length=1, max_length=64)


class SendEmailResponse(BaseModel):
    status: str
    message_id: str
    lead_id: str
    to: str
    subject: str
    provider: str
    sent_at: datetime