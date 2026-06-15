from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class EmailAttachmentRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=3, max_length=120)
    content_base64: str = Field(min_length=4, max_length=14_000_000)
    size_bytes: int = Field(ge=1, le=5 * 1024 * 1024)


class EmailSendRequest(BaseModel):
    to: str = Field(min_length=3, max_length=320)
    subject: str = Field(min_length=1, max_length=255)
    message: str | None = Field(default=None, min_length=1, max_length=20000)
    body_plain: str | None = Field(default=None, min_length=1, max_length=20000)
    body_html: str | None = Field(default=None, min_length=1, max_length=100000)
    lead_id: str = Field(min_length=1, max_length=120)
    template_id: str | None = Field(default=None, min_length=1, max_length=64)
    primary_color: str | None = Field(default=None, min_length=4, max_length=16)
    secondary_color: str | None = Field(default=None, min_length=4, max_length=16)
    sender_name: str | None = Field(default=None, min_length=1, max_length=120)
    reply_to: str | None = Field(default=None, min_length=3, max_length=320)
    backup_to: str | None = Field(default=None, min_length=3, max_length=320)
    attachment: EmailAttachmentRequest | None = None
    custom_args: dict[str, Any] = Field(default_factory=dict)


class EmailSendResponse(BaseModel):
    status: str
    message_id: str
    lead_id: str
    to: str
    subject: str
    provider: str
    sent_at: datetime


class EmailGenerateRequest(BaseModel):
    lead_name: str = Field(default="", max_length=120)
    lead_company: str = Field(default="", max_length=120)
    lead_notes: str = Field(default="", max_length=2000)
    lead_stage: str = Field(default="", max_length=30)
    lead_score: int = Field(default=0, ge=0, le=100)
    lead_source: str = Field(default="", max_length=30)
    pain_point: str = Field(default="", max_length=500)
    suggested_pitch: str = Field(default="", max_length=500)
    buying_signals: list[str] = Field(default_factory=list)
    custom_context: str = Field(default="", max_length=2000)
    tone: str = Field(default="professional", pattern="^(professional|friendly|direct)$")
    max_words: int = Field(default=130, ge=30, le=300)


class EmailGenerateResponse(BaseModel):
    subject: str
    body: str
    confidence: int = Field(default=85, ge=0, le=100)
    provider: str = Field(default="gemini")
