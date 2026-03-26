from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LeadModel(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    source: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(String(2000), nullable=False)
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    tags: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
