from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CRMModel(Base):
    __tablename__ = "crm_records"

    lead_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    note: Mapped[str] = mapped_column(String(1000), nullable=True)
    follow_up_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
