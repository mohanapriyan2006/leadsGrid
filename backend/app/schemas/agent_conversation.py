from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

AgentIntent = Literal[
    "leads_discovery",
    "crm_operations",
    "message_generation",
    "recycle_bin",
    "general",
    "unknown",
]

AgentResponseType = Literal[
    "text",
    "discovery_overview",
    "crm_form",
    "message_draft",
    "recycle_bin_action",
    "confirmation",
    "lead_select",
    "agent_form",
    "lead_picker",
]

AgentOperation = Literal["create", "read", "update", "delete", "restore", "permanent_delete", "send"]


class AgentActionButton(BaseModel):
    label: str
    action: str
    payload: dict[str, Any] = Field(default_factory=dict)
    style: Literal["primary", "secondary", "danger"] = "primary"


class AgentCardData(BaseModel):
    type: AgentResponseType
    title: str = ""
    description: str = ""
    data: dict[str, Any] = Field(default_factory=dict)
    actions: list[AgentActionButton] = Field(default_factory=list)
    requires_confirmation: bool = False


class AgentMessage(BaseModel):
    id: str
    role: Literal["user", "agent"] = "agent"
    type: AgentResponseType = "text"
    content: str
    card: AgentCardData | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AgentConversationState(BaseModel):
    session_id: str
    intent: AgentIntent = "unknown"
    pending_action: dict[str, Any] | None = None
    selected_lead_ids: list[str] = Field(default_factory=list)
    resolved_attached_leads: list[dict[str, Any]] = Field(default_factory=list)
    last_message: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AgentChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str | None = None
    attached_lead_ids: list[str] = Field(default_factory=list)
    confirmed_action: dict[str, Any] | None = None


class AgentChatResponse(BaseModel):
    agent_message: AgentMessage
    session_id: str
    requires_confirmation: bool = False


class AgentConfirmRequest(BaseModel):
    session_id: str
    action_id: str


class AgentCancelRequest(BaseModel):
    session_id: str
