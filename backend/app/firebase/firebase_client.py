import logging
from datetime import datetime, timezone
from uuid import uuid4

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

        batch = self._db.batch()
        for lead in leads:
            lead_id = lead.get("id") or str(uuid4())
            doc_ref = self._db.collection("users").document(user_id).collection("leads").document(lead_id)
            payload = {
                "title": lead.get("title"),
                "summary": lead.get("summary"),
                "platform": lead.get("platform"),
                "score": lead.get("score"),
                "status": "new",
                "created_at": datetime.now(timezone.utc),
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
