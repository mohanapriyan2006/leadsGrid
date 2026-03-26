from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


LeadSource = Literal["reddit", "twitter", "linkedin"]


class Lead(BaseModel):
    id: str
    source: LeadSource
    author: str
    permalink: str | None = None
    content: str
    summary: str
    score: int = Field(ge=0, le=100)
    tags: list[str] = Field(default_factory=list)
    intent_label: str
    created_at: datetime


class LeadFetchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=200)
    source: LeadSource = "reddit"
    limit: int = Field(default=10, ge=1, le=50)
