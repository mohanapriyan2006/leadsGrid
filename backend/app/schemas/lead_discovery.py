from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# STAGE 1 — Gatekeeper (Intent Classification)
# ---------------------------------------------------------------------------
class Stage1Output(BaseModel):
    category: str = Field(..., description="e.g. HIRING_NOW, SERVICE_NEEDED, LEARNING_ONLY, SPAM")
    is_actionable_lead: bool = Field(..., description="True if the lead should be kept")
    confidence_score: float = Field(..., ge=0.0, le=1.0)


# ---------------------------------------------------------------------------
# STAGE 2 — Deep Intelligence & Multi-Signal Scoring Engine
# ---------------------------------------------------------------------------
class DeepScores(BaseModel):
    intent_score: int = Field(..., ge=0, le=100, description="Score 0-100")
    urgency_score: int = Field(..., ge=0, le=100, description="Score 0-100")
    budget_score: int = Field(..., ge=0, le=100, description="Score 0-100")


class Stage2Output(BaseModel):
    industry: str = Field(..., description="SaaS|Fintech|Ecommerce|Agency|HealthTech|Other")
    authority_level: str = Field(..., description="Founder|CEO|CTO|Manager|Developer|Unknown")
    authority_confidence: int = Field(..., ge=0, le=100)
    buying_stage: str = Field(
        ...,
        description="PROBLEM_AWARE|SOLUTION_AWARE|COMPARISON|READY_TO_BUY",
    )
    scores: DeepScores
    primary_problem: str = Field(..., description="Clear, 1-sentence breakdown of their main bottleneck")
    secondary_problems: list[str] = Field(default_factory=list)
    desired_outcome: str = Field(..., description="What success looks like for them")
    evidence_logs: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# STAGE 3 — 90-Day Closing Verifier (The Deal Closer)
# ---------------------------------------------------------------------------
class Stage3Output(BaseModel):
    verdict: str = Field(..., pattern="^(YES|LIKELY|UNLIKELY|NO)$")
    closing_confidence: int = Field(..., ge=0, le=100)
    recommended_action: str = Field(..., description="e.g. Pitch custom development services")


# ---------------------------------------------------------------------------
# Incoming raw signal (e.g. from scraper cron / aggregator)
# ---------------------------------------------------------------------------
class RawSignalInput(BaseModel):
    source: str = Field(..., description="reddit, linkedin, github, hn, search, etc.")
    title: str
    content: str
    comments: Optional[str] = Field(default="")
    author: Optional[str] = Field(default="Unknown")
    engagement_upvotes: int = Field(default=0)
    freshness_hours: float = Field(default=1.0)


# ---------------------------------------------------------------------------
# Final enriched record returned to the UI
# ---------------------------------------------------------------------------
class EnrichedLeadRecord(BaseModel):
    # Core identity (inherited from raw record)
    source: str
    title: str
    content: str
    author: str
    permalink: Optional[str] = None
    created_at: Optional[str] = None
    engagement_upvotes: int = 0
    freshness_hours: float = 1.0

    # AI enrichment flags
    ai_enriched: bool = False
    ai_dropped: bool = False
    drop_reason: Optional[str] = None

    # Stage 1
    lead_category: Optional[str] = None
    is_actionable_lead: Optional[bool] = None
    stage1_confidence: Optional[float] = None

    # Stage 2
    industry: Optional[str] = None
    authority_level: Optional[str] = None
    authority_confidence: Optional[int] = None
    buying_stage: Optional[str] = None
    primary_problem: Optional[str] = None
    secondary_problems: list[str] = Field(default_factory=list)
    desired_outcome: Optional[str] = None
    evidence: list[str] = Field(default_factory=list)

    # Stage 3
    verdict: Optional[str] = None
    closing_confidence: Optional[int] = None
    recommended_action: Optional[str] = None

    # Multi-signal computed score
    lead_score: int = Field(default=0, ge=0, le=100)
    priority: str = Field(default="LOW", pattern="^(HOT|HIGH|MEDIUM|LOW)$")

    # Legacy / fallback
    raw_score: Optional[float] = None
    score_explanation: Optional[dict] = None


class DiscoverAsyncResponse(BaseModel):
    status: str = Field(default="queued")
    message: str = Field(default="Signal pipeline processing started concurrently.")
