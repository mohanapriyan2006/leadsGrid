from pydantic import BaseModel, Field


class LeadScoringRequest(BaseModel):
    content: str = Field(min_length=5)


class LeadScoringResponse(BaseModel):
    summary: str
    score: int = Field(ge=0, le=100)
    tags: list[str] = Field(default_factory=list)
    intent_label: str
    provider: str


class MessageGenerationRequest(BaseModel):
    lead_context: str = Field(min_length=5)
    tone: str = Field(default="professional", min_length=3, max_length=30)
    max_words: int = Field(default=120, ge=40, le=240)


class MessageGenerationResponse(BaseModel):
    message: str
    confidence: int = Field(ge=0, le=100)
    provider: str
    draft: str | None = None
    evaluation: str | None = None
