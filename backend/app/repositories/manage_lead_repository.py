from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime
from uuid import uuid4

from sqlalchemy import and_, desc, select, text

from app.core.database import SessionLocal
from app.models.lead import AIAnalysisModel, LeadActivityModel, LeadModel, LeadStageModel
from app.schemas.lead import BinLead, LeadListFilters, ManageLeadActivity


class ManageLeadRepository:
    def _ensure_schema(self) -> None:
        with SessionLocal() as db:
            dialect = db.bind.dialect.name if db.bind is not None else ""
            if dialect != "sqlite":
                return

            table_check = db.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='leads'")
            ).first()
            if table_check is None:
                return

            rows = db.execute(text("PRAGMA table_info(leads)")).all()
            existing_columns = {row[1] for row in rows}
            column_ddl = {
                "name": "ALTER TABLE leads ADD COLUMN name VARCHAR(120) NOT NULL DEFAULT 'Unknown'",
                "company": "ALTER TABLE leads ADD COLUMN company VARCHAR(160) NOT NULL DEFAULT 'Unknown Company'",
                "stage": "ALTER TABLE leads ADD COLUMN stage VARCHAR(24) NOT NULL DEFAULT 'NEW'",
                "email": "ALTER TABLE leads ADD COLUMN email VARCHAR(160)",
                "phone": "ALTER TABLE leads ADD COLUMN phone VARCHAR(40)",
                "budget_estimate": "ALTER TABLE leads ADD COLUMN budget_estimate INTEGER NOT NULL DEFAULT 0",
                "urgency": "ALTER TABLE leads ADD COLUMN urgency VARCHAR(16) NOT NULL DEFAULT 'medium'",
                "intent_label": "ALTER TABLE leads ADD COLUMN intent_label VARCHAR(80) NOT NULL DEFAULT 'warm'",
                "last_activity_at": "ALTER TABLE leads ADD COLUMN last_activity_at DATETIME",
                "notes": "ALTER TABLE leads ADD COLUMN notes TEXT",
                "is_going_cold": "ALTER TABLE leads ADD COLUMN is_going_cold BOOLEAN NOT NULL DEFAULT 0",
                "is_deleted": "ALTER TABLE leads ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT 0",
                "deleted_at": "ALTER TABLE leads ADD COLUMN deleted_at DATETIME",
                "updated_at": "ALTER TABLE leads ADD COLUMN updated_at DATETIME",
            }

            for column_name, ddl in column_ddl.items():
                if column_name not in existing_columns:
                    db.execute(text(ddl))

            db.execute(text("UPDATE leads SET stage = CASE WHEN stage = 'NEW_LEADS' THEN 'NEW' WHEN stage = 'NEGOTIATION' THEN 'RESPONDED' WHEN stage = 'WON' THEN 'CONTRACTED' WHEN stage = 'LOST' THEN 'RESPONDED' ELSE stage END"))
            db.execute(text("UPDATE leads SET last_activity_at = COALESCE(last_activity_at, created_at)"))
            db.execute(text("UPDATE leads SET updated_at = COALESCE(updated_at, created_at)"))
            db.execute(text("UPDATE leads SET is_deleted = COALESCE(is_deleted, 0)"))
            db.commit()

    def list_leads(self, filters: LeadListFilters) -> list[LeadModel]:
        self._ensure_schema()
        with SessionLocal() as db:
            stmt = select(LeadModel)
            clauses = [LeadModel.is_deleted.is_(False)]

            if filters.query:
                like = f"%{filters.query.lower()}%"
                clauses.append(
                    (LeadModel.name.ilike(like))
                    | (LeadModel.company.ilike(like))
                    | (LeadModel.summary.ilike(like))
                    | (LeadModel.email.ilike(like))
                )
            if filters.stage:
                clauses.append(LeadModel.stage == filters.stage)
            if filters.source:
                clauses.append(LeadModel.source == filters.source)
            if filters.urgency:
                clauses.append(LeadModel.urgency == filters.urgency)
            clauses.append(LeadModel.score >= filters.min_score)
            if filters.only_hot:
                clauses.append(LeadModel.score >= 85)
            if filters.only_cold:
                clauses.append(LeadModel.is_going_cold.is_(True))

            stmt = stmt.where(and_(*clauses))

            if filters.sort_by == "last_activity":
                stmt = stmt.order_by(desc(LeadModel.last_activity_at))
            else:
                stmt = stmt.order_by(desc(LeadModel.score), desc(LeadModel.updated_at))

            return list(db.scalars(stmt).all())

    def list_bin(self) -> list[BinLead]:
        self._ensure_schema()
        with SessionLocal() as db:
            stmt = (
                select(LeadModel)
                .where(LeadModel.is_deleted.is_(True))
                .order_by(desc(LeadModel.deleted_at))
            )
            rows = list(db.scalars(stmt).all())
            return [
                BinLead(
                    id=row.id,
                    name=row.name,
                    company=row.company,
                    email=row.email,
                    deleted_at=row.deleted_at or row.updated_at,
                )
                for row in rows
            ]

    def get_lead(self, lead_id: str) -> LeadModel | None:
        self._ensure_schema()
        with SessionLocal() as db:
            return db.get(LeadModel, lead_id)

    def get_analysis(self, lead_id: str) -> AIAnalysisModel | None:
        with SessionLocal() as db:
            stmt = select(AIAnalysisModel).where(AIAnalysisModel.lead_id == lead_id)
            return db.scalars(stmt).first()

    def get_by_email(self, email: str) -> LeadModel | None:
        self._ensure_schema()
        normalized = email.strip().lower()
        with SessionLocal() as db:
            stmt = select(LeadModel).where(
                and_(LeadModel.email.is_not(None), LeadModel.email.ilike(normalized))
            )
            return db.scalars(stmt).first()

    def list_activities(self, lead_id: str) -> list[ManageLeadActivity]:
        with SessionLocal() as db:
            stmt = (
                select(LeadActivityModel)
                .where(LeadActivityModel.lead_id == lead_id)
                .order_by(desc(LeadActivityModel.created_at))
            )
            rows = list(db.scalars(stmt).all())
            return [
                ManageLeadActivity(
                    id=row.id,
                    lead_id=row.lead_id,
                    activity_type=row.activity_type,
                    message=row.message,
                    created_at=row.created_at,
                )
                for row in rows
            ]

    def upsert_lead(self, lead: LeadModel) -> LeadModel:
        self._ensure_schema()
        with SessionLocal() as db:
            db.merge(lead)
            db.commit()
            return db.get(LeadModel, lead.id)  # type: ignore[return-value]

    def create_lead(self, lead: LeadModel) -> LeadModel:
        self._ensure_schema()
        with SessionLocal() as db:
            db.add(lead)
            db.commit()
            return lead

    def soft_delete(self, lead_id: str, deleted_at: datetime) -> bool:
        with SessionLocal() as db:
            row = db.get(LeadModel, lead_id)
            if row is None or row.is_deleted:
                return False
            row.is_deleted = True
            row.deleted_at = deleted_at
            row.updated_at = deleted_at
            db.commit()
            return True

    def restore(self, lead_id: str, restored_at: datetime) -> bool:
        with SessionLocal() as db:
            row = db.get(LeadModel, lead_id)
            if row is None or not row.is_deleted:
                return False
            row.is_deleted = False
            row.deleted_at = None
            row.updated_at = restored_at
            db.commit()
            return True

    def delete_forever(self, lead_id: str) -> bool:
        with SessionLocal() as db:
            row = db.get(LeadModel, lead_id)
            if row is None:
                return False
            db.execute(
                text("DELETE FROM lead_activity WHERE lead_id = :lead_id"),
                {"lead_id": lead_id},
            )
            db.execute(
                text("DELETE FROM lead_stage WHERE lead_id = :lead_id"),
                {"lead_id": lead_id},
            )
            db.execute(
                text("DELETE FROM ai_analysis WHERE lead_id = :lead_id"),
                {"lead_id": lead_id},
            )
            db.delete(row)
            db.commit()
            return True

    def upsert_analysis(self, analysis: AIAnalysisModel) -> AIAnalysisModel:
        with SessionLocal() as db:
            existing = db.scalars(select(AIAnalysisModel).where(AIAnalysisModel.lead_id == analysis.lead_id)).first()
            if existing:
                existing.intent_score = analysis.intent_score
                existing.pain_points = analysis.pain_points
                existing.suggested_pitch = analysis.suggested_pitch
                existing.portfolio_match = analysis.portfolio_match
                existing.next_action = analysis.next_action
                existing.deal_probability = analysis.deal_probability
                existing.expected_close_days = analysis.expected_close_days
                existing.ghost_probability = analysis.ghost_probability
                existing.winning_strategy = analysis.winning_strategy
                existing.updated_at = analysis.updated_at
                db.commit()
                return existing

            db.add(analysis)
            db.commit()
            return analysis

    def add_activity(self, lead_id: str, activity_type: str, message: str, created_at: datetime) -> ManageLeadActivity:
        with SessionLocal() as db:
            row = LeadActivityModel(
                id=str(uuid4()),
                lead_id=lead_id,
                activity_type=activity_type,
                message=message,
                created_at=created_at,
            )
            db.add(row)
            db.commit()
            return ManageLeadActivity(
                id=row.id,
                lead_id=row.lead_id,
                activity_type=row.activity_type,
                message=row.message,
                created_at=row.created_at,
            )

    def add_stage_event(self, lead_id: str, from_stage: str | None, to_stage: str, reason: str | None, created_at: datetime) -> None:
        with SessionLocal() as db:
            row = LeadStageModel(
                id=str(uuid4()),
                lead_id=lead_id,
                from_stage=from_stage,
                to_stage=to_stage,
                reason=reason,
                created_at=created_at,
            )
            db.add(row)
            db.commit()

    def bulk_update_stage(self, lead_ids: Iterable[str], stage: str, now: datetime) -> int:
        updated = 0
        with SessionLocal() as db:
            for lead_id in lead_ids:
                row = db.get(LeadModel, lead_id)
                if row is None or row.is_deleted:
                    continue
                row.stage = stage
                row.last_activity_at = now
                row.updated_at = now
                updated += 1
            db.commit()
        return updated

    def count_active(self) -> int:
        self._ensure_schema()
        with SessionLocal() as db:
            stmt = select(LeadModel.id).where(LeadModel.is_deleted.is_(False))
            return len(db.scalars(stmt).all())


manage_lead_repository = ManageLeadRepository()
