from __future__ import annotations

from uuid import uuid4

from sqlalchemy import and_, desc, select, text

from app.core.database import SessionLocal
from app.models.lead import AIAnalysisModel, LeadActivityModel, LeadModel, LeadStageModel
from app.schemas.lead import LeadListFilters, ManageLead, ManageLeadActivity


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
                "stage": "ALTER TABLE leads ADD COLUMN stage VARCHAR(24) NOT NULL DEFAULT 'NEW_LEADS'",
                "email": "ALTER TABLE leads ADD COLUMN email VARCHAR(160)",
                "phone": "ALTER TABLE leads ADD COLUMN phone VARCHAR(40)",
                "budget_estimate": "ALTER TABLE leads ADD COLUMN budget_estimate INTEGER NOT NULL DEFAULT 0",
                "urgency": "ALTER TABLE leads ADD COLUMN urgency VARCHAR(16) NOT NULL DEFAULT 'medium'",
                "intent_label": "ALTER TABLE leads ADD COLUMN intent_label VARCHAR(80) NOT NULL DEFAULT 'warm'",
                "last_activity_at": "ALTER TABLE leads ADD COLUMN last_activity_at DATETIME",
                "notes": "ALTER TABLE leads ADD COLUMN notes TEXT",
                "is_going_cold": "ALTER TABLE leads ADD COLUMN is_going_cold BOOLEAN NOT NULL DEFAULT 0",
                "updated_at": "ALTER TABLE leads ADD COLUMN updated_at DATETIME",
            }

            for column_name, ddl in column_ddl.items():
                if column_name not in existing_columns:
                    db.execute(text(ddl))

            db.execute(text("UPDATE leads SET last_activity_at = COALESCE(last_activity_at, created_at)"))
            db.execute(text("UPDATE leads SET updated_at = COALESCE(updated_at, created_at)"))
            db.commit()

    def list_leads(self, filters: LeadListFilters) -> list[LeadModel]:
        self._ensure_schema()
        with SessionLocal() as db:
            stmt = select(LeadModel)
            clauses = []

            if filters.query:
                like = f"%{filters.query.lower()}%"
                clauses.append(
                    (LeadModel.name.ilike(like))
                    | (LeadModel.company.ilike(like))
                    | (LeadModel.summary.ilike(like))
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

            if clauses:
                stmt = stmt.where(and_(*clauses))

            if filters.sort_by == "last_activity":
                stmt = stmt.order_by(desc(LeadModel.last_activity_at))
            else:
                stmt = stmt.order_by(desc(LeadModel.score))

            return list(db.scalars(stmt).all())

    def get_lead(self, lead_id: str) -> LeadModel | None:
        self._ensure_schema()
        with SessionLocal() as db:
            return db.get(LeadModel, lead_id)

    def get_analysis(self, lead_id: str) -> AIAnalysisModel | None:
        with SessionLocal() as db:
            stmt = select(AIAnalysisModel).where(AIAnalysisModel.lead_id == lead_id)
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

    def list_stage_history(self, lead_id: str) -> list[LeadStageModel]:
        with SessionLocal() as db:
            stmt = (
                select(LeadStageModel)
                .where(LeadStageModel.lead_id == lead_id)
                .order_by(desc(LeadStageModel.created_at))
            )
            return list(db.scalars(stmt).all())

    def upsert_lead(self, lead: LeadModel) -> LeadModel:
        with SessionLocal() as db:
            db.merge(lead)
            db.commit()
            return db.get(LeadModel, lead.id)  # type: ignore[return-value]

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

    def add_activity(self, lead_id: str, activity_type: str, message: str, created_at) -> ManageLeadActivity:
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

    def add_stage_event(self, lead_id: str, from_stage: str | None, to_stage: str, reason: str | None, created_at) -> None:
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

    def count(self) -> int:
        self._ensure_schema()
        with SessionLocal() as db:
            return len(db.scalars(select(LeadModel.id)).all())


manage_lead_repository = ManageLeadRepository()
