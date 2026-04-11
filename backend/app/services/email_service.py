import asyncio
import smtplib
from collections import deque
from datetime import datetime, timedelta, timezone
from email.mime.text import MIMEText
from uuid import uuid4

from app.core.config import Settings


class EmailService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._sent_window = deque()

    @property
    def enabled(self) -> bool:
        return bool(self.settings.smtp_sender and self.settings.smtp_app_password)

    def _enforce_rate_limit(self) -> None:
        now = datetime.now(timezone.utc)
        boundary = now - timedelta(minutes=1)

        while self._sent_window and self._sent_window[0] < boundary:
            self._sent_window.popleft()

        if len(self._sent_window) >= self.settings.smtp_rate_limit_per_min:
            raise RuntimeError("SMTP rate limit exceeded. Retry in a minute.")

        self._sent_window.append(now)

    def _send_sync(self, to_email: str, subject: str, body: str) -> dict:
        self._enforce_rate_limit()

        message = MIMEText(body)
        message["Subject"] = subject
        message["From"] = self.settings.smtp_sender or ""
        message["To"] = to_email

        with smtplib.SMTP_SSL(self.settings.smtp_host, self.settings.smtp_port) as server:
            server.login(self.settings.smtp_sender, self.settings.smtp_app_password)
            server.sendmail(self.settings.smtp_sender, [to_email], message.as_string())

        return {
            "status": "sent",
            "messageId": str(uuid4()),
            "to": to_email,
            "subject": subject,
            "provider": "smtp",
            "sentAt": datetime.now(timezone.utc).isoformat(),
        }

    async def send_email(self, to_email: str, subject: str, body: str) -> dict:
        if not self.enabled:
            return {
                "status": "simulated",
                "messageId": str(uuid4()),
                "to": to_email,
                "subject": subject,
                "provider": "smtp-disabled",
                "sentAt": datetime.now(timezone.utc).isoformat(),
            }

        return await asyncio.to_thread(self._send_sync, to_email, subject, body)
