from datetime import datetime
from uuid import uuid4

from sqlalchemy import and_, select, text

from app.core.database import SessionLocal
from app.models.message import MessageModel


class MessageRepository:
    def _ensure_schema(self) -> None:
        with SessionLocal() as db:
            dialect = db.bind.dialect.name if db.bind is not None else ""
            if dialect != "sqlite":
                return

            table_check = db.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'")
            ).first()
            if table_check is None:
                return

            rows = db.execute(text("PRAGMA table_info(messages)")).all()
            existing_columns = {row[1] for row in rows}
            column_ddl = {
                "email": "ALTER TABLE messages ADD COLUMN email VARCHAR(160) NOT NULL DEFAULT ''",
                "subject": "ALTER TABLE messages ADD COLUMN subject VARCHAR(300) NOT NULL DEFAULT ''",
                "status": "ALTER TABLE messages ADD COLUMN status VARCHAR(24) NOT NULL DEFAULT 'sent'",
                "error_message": "ALTER TABLE messages ADD COLUMN error_message VARCHAR(500)",
            }

            for column_name, ddl in column_ddl.items():
                if column_name not in existing_columns:
                    db.execute(text(ddl))

            db.commit()

    def create(
        self,
        lead_id: str,
        email: str,
        subject: str,
        content: str,
        status: str,
        provider: str,
        created_at: datetime,
        error_message: str | None = None,
    ) -> MessageModel:
        self._ensure_schema()
        with SessionLocal() as db:
            message = MessageModel(
                id=str(uuid4()),
                lead_id=lead_id,
                email=email,
                subject=subject,
                content=content,
                status=status,
                provider=provider,
                confidence=0,
                error_message=error_message,
                created_at=created_at,
            )
            db.add(message)
            db.commit()
            return message

    def list_by_lead(self, lead_id: str) -> list[MessageModel]:
        self._ensure_schema()
        with SessionLocal() as db:
            stmt = (
                select(MessageModel)
                .where(and_(MessageModel.lead_id == lead_id))
                .order_by(MessageModel.created_at.desc())
            )
            return list(db.scalars(stmt).all())


message_repository = MessageRepository()