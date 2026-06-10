from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


AgentActionType = Literal[
    "lead_discovery",
    "lead_scoring",
    "crm_update",
    "message_draft",
    "follow_up_schedule",
]

AgentStepStatus = Literal["pending", "running", "completed", "failed", "skipped"]
RiskLevel = Literal["low", "medium", "high"]
ApprovalMode = Literal["all", "step_by_step"]
ToneType = Literal["professional", "friendly", "direct"]
AgentRunLifecycleStatus = Literal["running", "paused", "completed", "failed", "aborted"]


class LeadItem(BaseModel):
    id: str | None = None
    title: str
    summary: str = ""
    content: str = ""
    platform: str = "unknown"
    score: float = 0
    upvotes: int = 0
    url: str | None = None
    author: str | None = None
    email: str | None = None
    created_at: str | None = None

    # 3-stage AI pipeline enrichment
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


class AgentStepEvaluation(BaseModel):
    score: int = Field(ge=0, le=100)
    quality: Literal["excellent", "good", "needs_improvement"]
    issues: list[str] = Field(default_factory=list)
    improvement: str | None = None


class AgentStep(BaseModel):
    id: str
    label: str
    description: str
    actionType: AgentActionType
    status: AgentStepStatus = "pending"
    riskLevel: RiskLevel = "low"
    result: str | None = None
    error: str | None = None
    evaluation: AgentStepEvaluation | None = None


class AgentPlan(BaseModel):
    id: str
    title: str
    steps: list[AgentStep]
    createdAt: datetime
    approved: bool = False
    approvalMode: ApprovalMode | None = None


class AgentPlanRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)
    leads: list[LeadItem] = Field(default_factory=list)


class EnhancedLeadContext(BaseModel):
    leadId: str | None = None
    name: str
    company: str
    painPoint: str
    intentScore: float
    urgency: Literal["low", "medium", "high"]
    budgetHint: Literal["low", "mid", "mid-high", "high", "unknown"]
    recommendedPitch: str
    priority: Literal["low", "medium", "high"]


class AgentContextPreview(BaseModel):
    leads: list[EnhancedLeadContext] = Field(default_factory=list)
    summary: str = ""


class AgentPlanResponse(BaseModel):
    plan: AgentPlan
    contextPreview: AgentContextPreview | None = None


class AgentExecuteRequest(BaseModel):
    step: AgentStep
    prompt: str = Field(min_length=3, max_length=2000)
    leads: list[LeadItem] = Field(default_factory=list)
    tone: ToneType = "professional"
    userId: str | None = None
    autoSave: bool = True


class AgentActionResult(BaseModel):
    success: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)


class AgentRunStartRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)
    leads: list[LeadItem] = Field(default_factory=list)
    tone: ToneType = "professional"
    userId: str | None = None
    autoSave: bool = True
    approvalMode: ApprovalMode = "all"
    autoApproveLowRisk: bool = False


class AgentRunAdvanceRequest(BaseModel):
    autoApproveLowRisk: bool | None = None


class AgentRunState(BaseModel):
    runId: str
    status: AgentRunLifecycleStatus
    plan: AgentPlan
    currentStepIndex: int
    completedSteps: int
    totalSteps: int
    startedAt: datetime
    completedAt: datetime | None = None
    updatedAt: datetime
    results: list[AgentActionResult] = Field(default_factory=list)


class AgentRunStateResponse(BaseModel):
    run: AgentRunState


class AgentRunRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)
    leads: list[LeadItem] = Field(default_factory=list)
    tone: ToneType = "professional"
    userId: str | None = None
    autoSave: bool = True


class AgentRunResponse(BaseModel):
    status: Literal["completed", "failed"]
    plan: AgentPlan
    results: list[AgentActionResult]
