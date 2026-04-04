import logging
from datetime import datetime, timezone
from uuid import uuid4
from typing import Any

from app.core.config import Settings

logger = logging.getLogger(__name__)


class FirebaseClient:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._enabled = False
        self._db = None
        self._auth = None

    @property
    def enabled(self) -> bool:
        return self._enabled

    def initialize(self) -> None:
        if not self.settings.firebase_service_account_path:
            logger.info("Firebase service account not configured. Persistence will be simulated.")
            return

        try:
            import firebase_admin
            from firebase_admin import auth, credentials, firestore

            if not firebase_admin._apps:
                cred = credentials.Certificate(self.settings.firebase_service_account_path)
                firebase_admin.initialize_app(cred, {"projectId": self.settings.firebase_project_id})

            self._db = firestore.client()
            self._auth = auth
            self._enabled = True
            logger.info("Firebase initialized successfully.")
        except Exception as exc:
            logger.warning("Firebase initialization failed: %s", exc)

    def verify_token(self, token: str) -> str | None:
        if not self._enabled or not self._auth:
            return None

        try:
            decoded = self._auth.verify_id_token(token)
            return decoded.get("uid")
        except Exception:
            return None

    def save_leads(self, user_id: str, leads: list[dict]) -> dict:
        if not self._enabled or not self._db:
            return {
                "saved": False,
                "count": 0,
                "reason": "firebase-disabled",
            }

        def parse_created(value: Any) -> datetime:
            if isinstance(value, datetime):
                return value if value.tzinfo else value.replace(tzinfo=timezone.utc)

            if isinstance(value, (int, float)):
                return datetime.fromtimestamp(value, tz=timezone.utc)

            if isinstance(value, str) and value.strip():
                text = value.strip()
                try:
                    return datetime.fromisoformat(text.replace("Z", "+00:00"))
                except ValueError:
                    return datetime.now(timezone.utc)

            return datetime.now(timezone.utc)

        def to_urgency(score_value: float) -> str:
            if score_value >= 85:
                return "high"
            if score_value >= 65:
                return "medium"
            return "low"

        batch = self._db.batch()
        for lead in leads:
            lead_id = lead.get("id") or str(uuid4())
            doc_ref = self._db.collection("users").document(user_id).collection("leads").document(lead_id)
            title = (lead.get("title") or "").strip()
            author = (lead.get("author") or "").strip()
            summary = (lead.get("summary") or lead.get("content") or "").strip()
            summary_label = summary[:80] if summary else ""
            name = author or title or summary_label or "Unknown"
            company = title or author or name
            platform = (lead.get("platform") or "search").strip().lower() or "search"
            created_at_raw = lead.get("created_at")
            created_at_dt = parse_created(created_at_raw)
            now = datetime.now(timezone.utc)
            score = float(lead.get("score") or 0)

            payload = {
                # Canonical ManageLead-compatible fields used by frontend boards.
                "name": name,
                "company": company,
                "email": lead.get("email"),
                "phone": None,
                "status": "new",
                "pipelineStage": "NEW",
                "isDeleted": False,
                "deletedAt": None,
                "source": platform if platform in {"reddit", "linkedin", "twitter", "hackernews", "search"} else "ai",
                "notes": lead.get("summary") or None,
                "tags": lead.get("tags") if isinstance(lead.get("tags"), list) else [platform],
                "budgetEstimate": 0,
                "score": score,
                "urgency": to_urgency(score),
                "createdAt": created_at_dt,
                "updatedAt": now,
                "lastActivityAt": now,

                # Preserve discovery payload fields for full frontend Lead compatibility.
                "title": lead.get("title"),
                "summary": lead.get("summary"),
                "content": lead.get("content"),
                "platform": platform,
                "author": lead.get("author"),
                "url": lead.get("url"),
                "upvotes": int(lead.get("upvotes") or 0),
                "created_at": created_at_dt.isoformat(),
            }
            batch.set(doc_ref, payload, merge=True)

        batch.commit()
        return {"saved": True, "count": len(leads)}

    def log_agent_run(self, user_id: str, task: str, status: str, steps: list[dict]) -> dict:
        if not self._enabled or not self._db:
            return {"logged": False, "reason": "firebase-disabled"}

        run_ref = self._db.collection("users").document(user_id).collection("agent_runs").document()
        run_ref.set(
            {
                "task": task,
                "status": status,
                "steps": steps,
                "created_at": datetime.now(timezone.utc),
            }
        )
        return {"logged": True, "runId": run_ref.id}
