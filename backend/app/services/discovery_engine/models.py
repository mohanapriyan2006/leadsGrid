from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class DiscoveryFilters(BaseModel):
    min_score: int = Field(default=0, ge=0, le=100)
    max_age_days: int = Field(default=30, ge=1, le=365)
    sources: list[str] = Field(default_factory=list)
    exclude_terms: list[str] = Field(default_factory=list)


class QueryPlan(BaseModel):
    base_query: str
    variations: list[str] = Field(default_factory=list)
    github_queries: list[str] = Field(default_factory=list)
    hackernews_queries: list[str] = Field(default_factory=list)
    stackexchange_queries: list[str] = Field(default_factory=list)
    search_queries: list[str] = Field(default_factory=list)


class RawSignal(BaseModel):
    source: str
    source_type: str = "unknown"
    title: str = ""
    content: str = ""
    comments: str = ""
    author: str | None = None
    author_url: str | None = None
    url: str | None = None
    created_at: str | None = None
    engagement: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)

    def full_text(self) -> str:
        return f"{self.title} {self.content} {self.comments}".strip()


class EnrichedLead(BaseModel):
    id: str | None = None
    title: str = ""
    summary: str = ""
    content: str = ""
    platform: str = "unknown"
    score: float = 0.0
    upvotes: int = 0
    url: str | None = None
    author: str | None = None
    email: str | None = None
    created_at: str | None = None

    # AI pipeline enrichment
    ai_enriched: bool = False
    ai_dropped: bool = False
    drop_reason: str | None = None
    lead_category: str | None = None
    is_actionable_lead: bool | None = None
    industry: str | None = None
    authority_level: str | None = None
    authority_confidence: int | None = None
    buying_stage: str | None = None
    primary_problem: str | None = None
    secondary_problems: list[str] = Field(default_factory=list)
    desired_outcome: str | None = None
    evidence: list[str] = Field(default_factory=list)
    verdict: str | None = None
    closing_confidence: int | None = None
    recommended_action: str | None = None
    lead_score: int = 0
    priority: str = "LOW"
    raw_score: float | None = None
    opportunity_score: int = 0
    reachability_score: int = 0
    revenue_potential: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    def model_dump_legacy(self) -> dict[str, Any]:
        """Return a flat dict compatible with the frontend LeadItem schema."""
        d = self.model_dump()
        # Ensure backwards compatibility with old field names
        d["source"] = self.platform
        d["permalink"] = self.url
        d["engagement_upvotes"] = self.upvotes
        return d
