from pydantic import BaseModel, Field


class LeadIntentScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    urgency: str = Field(..., pattern="^(low|medium|high)$")
    budget: str = Field(..., pattern="^(low|medium|high|unknown)$")
    decision_maker: str = Field(..., pattern="^(yes|no|unknown)$")
    pain_point: str
    lead_type: str = Field(..., pattern="^(job|complaint|learning|hiring)$")


class AdvancedLeadIntentScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    urgency: str = Field(..., pattern="^(low|medium|high)$")
    buying_signals: list[str] = Field(default_factory=list)
    decision_maker: str = Field(..., pattern="^(yes|no|unknown)$")
    pain_point: str = Field(..., min_length=1, max_length=500)
    category: str = Field(..., pattern="^(hiring|problem|switching|learning|discussion)$")
    status: str = Field(..., pattern="^(qualified|unqualified)$")

    model_config = {"extra": "forbid"}


class LeadValidation(BaseModel):
    is_valid_lead: bool
    reason: str


class OutreachMessage(BaseModel):
    message: str


class FollowUpMessage(BaseModel):
    message: str


class ActionSuggestion(BaseModel):
    action: str = Field(..., pattern="^(ignore|save|contact_now)$")
    reason: str


class PortfolioMatch(BaseModel):
    project_name: str
    why_match: str


class LeadAnalysisRequest(BaseModel):
    lead_text: str = Field(..., min_length=5, max_length=5000)
    lead_title: str = Field(default="")
    lead_author: str = Field(default="")
    user_projects: list[dict] = Field(default_factory=list)
    score: int = Field(default=0)


class LeadAnalysisResponse(BaseModel):
    intent: LeadIntentScore
    validation: LeadValidation
    outreach: OutreachMessage
    follow_up: FollowUpMessage
    action: ActionSuggestion
    portfolio_match: PortfolioMatch | None
