from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LeadModel(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    source: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False, default="Unknown")
    company: Mapped[str] = mapped_column(String(160), nullable=False, default="Unknown Company")
    stage: Mapped[str] = mapped_column(String(24), nullable=False, default="NEW_LEADS")
    email: Mapped[str | None] = mapped_column(String(160), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    budget_estimate: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    urgency: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    content: Mapped[str] = mapped_column(String(2000), nullable=False)
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    tags: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    intent_label: Mapped[str] = mapped_column(String(80), nullable=False, default="warm")
    last_activity_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_going_cold: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LeadStageModel(Base):
    __tablename__ = "lead_stage"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    lead_id: Mapped[str] = mapped_column(String(64), ForeignKey("leads.id"), nullable=False, index=True)
    from_stage: Mapped[str | None] = mapped_column(String(24), nullable=True)
    to_stage: Mapped[str] = mapped_column(String(24), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(400), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LeadActivityModel(Base):
    __tablename__ = "lead_activity"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    lead_id: Mapped[str] = mapped_column(String(64), ForeignKey("leads.id"), nullable=False, index=True)
    activity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class AIAnalysisModel(Base):
    __tablename__ = "ai_analysis"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    lead_id: Mapped[str] = mapped_column(String(64), ForeignKey("leads.id"), nullable=False, unique=True, index=True)
    intent_score: Mapped[int] = mapped_column(Integer, nullable=False)
    pain_points: Mapped[str] = mapped_column(String(1500), nullable=False, default="")
    suggested_pitch: Mapped[str] = mapped_column(String(1000), nullable=False)
    portfolio_match: Mapped[str] = mapped_column(String(500), nullable=False)
    next_action: Mapped[str] = mapped_column(String(200), nullable=False)
    deal_probability: Mapped[int] = mapped_column(Integer, nullable=False)
    expected_close_days: Mapped[int] = mapped_column(Integer, nullable=False)
    ghost_probability: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    winning_strategy: Mapped[str] = mapped_column(String(1000), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
