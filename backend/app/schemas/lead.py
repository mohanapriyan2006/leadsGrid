from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


LeadSource = Literal["reddit", "twitter", "linkedin"]
LeadManageSource = Literal["reddit", "linkedin", "website"]
LeadStage = Literal["NEW_LEADS", "QUALIFIED", "CONTACTED", "NEGOTIATION", "WON", "LOST"]
LeadUrgency = Literal["low", "medium", "high"]
LeadActionType = Literal["SEND_FOLLOW_UP", "PROPOSE_PRICING", "SCHEDULE_CALL", "MOVE_STAGE"]


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
    stage: LeadStage = "NEW_LEADS"
    company: str = "Unknown Company"
    email: str | None = None
    phone: str | None = None
    budget_estimate: int = 0
    urgency: LeadUrgency = "medium"
    last_activity_at: datetime | None = None


class LeadFetchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=200)
    source: LeadSource = "reddit"
    limit: int = Field(default=10, ge=1, le=50)


class LeadListFilters(BaseModel):
    query: str | None = None
    stage: LeadStage | None = None
    source: LeadManageSource | None = None
    min_score: int = Field(default=0, ge=0, le=100)
    only_hot: bool = False
    only_cold: bool = False
    urgency: LeadUrgency | None = None
    sort_by: Literal["score", "urgency", "last_activity", "probability"] = "score"


class AIAnalysis(BaseModel):
    intent_score: int = Field(ge=0, le=100)
    pain_points: list[str] = Field(default_factory=list)
    suggested_pitch: str
    portfolio_match: str
    next_action: str
    deal_probability: int = Field(ge=0, le=100)
    expected_close_days: int = Field(ge=0, le=365)
    ghost_probability: int = Field(ge=0, le=100)
    winning_strategy: str


class ManageLead(BaseModel):
    id: str
    name: str
    company: str
    source: LeadManageSource
    stage: LeadStage
    email: str | None = None
    phone: str | None = None
    budget_estimate: int = Field(default=0, ge=0)
    urgency: LeadUrgency = "medium"
    score: int = Field(ge=0, le=100)
    last_activity_at: datetime
    created_at: datetime
    updated_at: datetime
    notes: str | None = None
    is_going_cold: bool = False
    ai_analysis: AIAnalysis


class ManageLeadActivity(BaseModel):
    id: str
    lead_id: str
    activity_type: str
    message: str
    created_at: datetime


class ManageLeadInsights(BaseModel):
    hot_leads_need_reply: int
    leads_going_cold: int
    leads_likely_to_close: int


class ManageLeadAnalytics(BaseModel):
    total_leads: int
    won_count: int
    lost_count: int
    conversion_rate: float
    pipeline_value: int
    stage_drop_offs: dict[str, int]


class LeadActionRequest(BaseModel):
    action_type: LeadActionType
    note: str | None = None
    target_stage: LeadStage | None = None


class LeadUpdateRequest(BaseModel):
    stage: LeadStage | None = None
    notes: str | None = None
    budget_estimate: int | None = Field(default=None, ge=0)
    urgency: LeadUrgency | None = None
    email: str | None = None
    phone: str | None = None


class AutomationRunResult(BaseModel):
    reminders_due: int
    follow_ups_generated: int
    leads_marked_cold: int
