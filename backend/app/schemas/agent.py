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


class AgentStep(BaseModel):
    id: str
    label: str
    description: str
    actionType: AgentActionType
    status: AgentStepStatus = "pending"
    riskLevel: RiskLevel = "low"
    result: str | None = None
    error: str | None = None


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


class AgentPlanResponse(BaseModel):
    plan: AgentPlan


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
