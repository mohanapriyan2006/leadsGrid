import smtplib
from email.mime.text import MIMEText

from app.core.config import settings


class EmailDeliveryError(Exception):
    pass


class EmailService:
    def _build_message(self, to_email: str, subject: str, body: str) -> MIMEText:
        message = MIMEText(body)
        message["Subject"] = subject
        message["From"] = settings.email_from
        message["To"] = to_email
        return message

    def send_email(self, to_email: str, subject: str, body: str) -> None:
        if not settings.smtp_username or not settings.smtp_password:
            raise EmailDeliveryError("SMTP credentials are not configured")

        message = self._build_message(to_email, subject, body)
        try:
            if settings.smtp_use_ssl:
                with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20) as server:
                    server.login(settings.smtp_username, settings.smtp_password)
                    server.send_message(message)
                return

            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
                server.starttls()
                server.login(settings.smtp_username, settings.smtp_password)
                server.send_message(message)
        except OSError as exc:
            raise EmailDeliveryError("Failed to deliver email") from exc


email_service = EmailService()