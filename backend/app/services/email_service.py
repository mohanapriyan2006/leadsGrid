import base64
import binascii
from collections import deque
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from typing import Any
from uuid import uuid4

import aiosmtplib

from app.core.config import Settings


class EmailService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._sent_window = deque()

    @property
    def enabled(self) -> bool:
        return bool(self.settings.smtp_effective_sender and self.settings.smtp_effective_password)

    def _enforce_rate_limit(self) -> None:
        now = datetime.now(timezone.utc)
        boundary = now - timedelta(minutes=1)

        while self._sent_window and self._sent_window[0] < boundary:
            self._sent_window.popleft()

        if len(self._sent_window) >= self.settings.smtp_rate_limit_per_min:
            raise RuntimeError("SMTP rate limit exceeded. Retry in a minute.")

        self._sent_window.append(now)

    async def _send_async(
        self,
        to_email: str,
        subject: str,
        body_plain: str,
        body_html: str | None = None,
        from_name: str | None = None,
        reply_to: str | None = None,
        backup_email: str | None = None,
        attachment: dict[str, Any] | None = None,
        custom_args: dict[str, Any] | None = None,
    ) -> dict:
        self._enforce_rate_limit()

        message = EmailMessage()
        message["Subject"] = subject
        sender_email = self.settings.smtp_effective_sender or ""
        if from_name:
            message["From"] = f"{from_name} <{sender_email}>"
        else:
            message["From"] = sender_email
        message["To"] = to_email
        if reply_to:
            message["Reply-To"] = reply_to
        message.set_content(body_plain)
        if body_html:
            message.add_alternative(body_html, subtype="html")

        if attachment:
            filename = str(attachment.get("filename") or "attachment")
            content_type = str(attachment.get("content_type") or "application/octet-stream")
            content_base64 = str(attachment.get("content_base64") or "")

            try:
                content_bytes = base64.b64decode(content_base64, validate=True)
            except (binascii.Error, ValueError) as exc:
                raise RuntimeError("Invalid attachment encoding") from exc

            if not content_bytes:
                raise RuntimeError("Attachment is empty")

            if len(content_bytes) > self.settings.smtp_max_attachment_bytes:
                raise RuntimeError("Attachment exceeds size limit")

            content_main_type, _, content_sub_type = content_type.partition("/")
            if not content_main_type or not content_sub_type:
                content_main_type = "application"
                content_sub_type = "octet-stream"

            message.add_attachment(
                content_bytes,
                maintype=content_main_type,
                subtype=content_sub_type,
                filename=filename,
            )

        # SMTP headers don't support provider-level custom args. Keep payload
        # compatible with provider-agnostic service callers.
        _ = custom_args

        recipients = [to_email]
        if backup_email and backup_email != to_email:
            recipients.append(backup_email)

        await aiosmtplib.send(
            message,
            recipients=recipients,
            hostname=self.settings.smtp_host,
            port=self.settings.smtp_port,
            start_tls=self.settings.smtp_use_starttls,
            username=self.settings.smtp_effective_sender,
            password=self.settings.smtp_effective_password,
            timeout=self.settings.smtp_timeout_seconds,
        )

        return {
            "status": "sent",
            "messageId": str(uuid4()),
            "to": to_email,
            "subject": subject,
            "provider": "smtp",
            "sentAt": datetime.now(timezone.utc).isoformat(),
        }

    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_plain: str,
        body_html: str | None = None,
        from_name: str | None = None,
        reply_to: str | None = None,
        backup_email: str | None = None,
        attachment: dict[str, Any] | None = None,
        custom_args: dict[str, Any] | None = None,
    ) -> dict:
        if not self.enabled:
            return {
                "status": "simulated",
                "messageId": str(uuid4()),
                "to": to_email,
                "subject": subject,
                "provider": "smtp-disabled",
                "sentAt": datetime.now(timezone.utc).isoformat(),
            }

        try:
            return await self._send_async(
                to_email=to_email,
                subject=subject,
                body_plain=body_plain,
                body_html=body_html,
                from_name=from_name,
                reply_to=reply_to,
                backup_email=backup_email,
                attachment=attachment,
                custom_args=custom_args,
            )
        except Exception as exc:
            return {
                "status": "failed",
                "messageId": str(uuid4()),
                "to": to_email,
                "subject": subject,
                "provider": "smtp",
                "error": str(exc),
                "sentAt": datetime.now(timezone.utc).isoformat(),
            }
