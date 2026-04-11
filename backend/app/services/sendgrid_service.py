import asyncio
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.core.config import Settings


class SendGridEmailService:
    def __init__(self, settings: Settings):
        self.settings = settings

    @property
    def enabled(self) -> bool:
        return bool(self.settings.sendgrid_api_key and self.settings.sendgrid_from_email)

    def _send_sync(
        self,
        to_email: str,
        subject: str,
        body: str,
        from_name: str | None = None,
        reply_to: str | None = None,
        custom_args: dict[str, Any] | None = None,
    ) -> dict:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, ReplyTo

        if not self.settings.sendgrid_api_key:
            raise RuntimeError("SENDGRID_API_KEY is missing")

        if not self.settings.sendgrid_from_email:
            raise RuntimeError("SENDGRID_FROM_EMAIL is missing")

        mail = Mail(
            from_email=(self.settings.sendgrid_from_email, from_name or "LeadsGrid"),
            to_emails=to_email,
            subject=subject,
            html_content=body,
            plain_text_content=body,
        )

        if reply_to:
            mail.reply_to = ReplyTo(reply_to)

        if custom_args:
            for key, value in custom_args.items():
                if value is None:
                    continue
                mail.custom_arg = (str(key), str(value))

        client = SendGridAPIClient(self.settings.sendgrid_api_key)
        response = client.send(mail)

        headers = response.headers or {}
        message_id = headers.get("X-Message-Id") or str(uuid4())

        return {
            "status": "sent" if response.status_code < 400 else "failed",
            "messageId": message_id,
            "to": to_email,
            "subject": subject,
            "provider": "sendgrid",
            "sentAt": datetime.now(timezone.utc).isoformat(),
            "httpStatus": response.status_code,
        }

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        from_name: str | None = None,
        reply_to: str | None = None,
        custom_args: dict[str, Any] | None = None,
    ) -> dict:
        if not self.enabled:
            return {
                "status": "simulated",
                "messageId": str(uuid4()),
                "to": to_email,
                "subject": subject,
                "provider": "sendgrid-disabled",
                "sentAt": datetime.now(timezone.utc).isoformat(),
            }

        return await asyncio.to_thread(
            self._send_sync,
            to_email,
            subject,
            body,
            from_name,
            reply_to,
            custom_args,
        )
