from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.security import UserContext, get_current_user
from app.schemas.email import EmailSendRequest, EmailSendResponse

router = APIRouter(prefix="/email", tags=["email"])


def _resolve_sender_name(requested_sender_name: str | None, fallback_email: str | None) -> str:
    if requested_sender_name and requested_sender_name.strip():
        return requested_sender_name.strip()

    if fallback_email and "@" in fallback_email:
        return fallback_email.split("@", 1)[0].strip() or "User"

    return "User"


def _looks_like_email(value: str | None) -> bool:
    if not value:
        return False
    text = value.strip()
    if " " in text:
        return False
    if "@" not in text:
        return False
    local, domain = text.split("@", 1)
    return bool(local and domain and "." in domain)


@router.post("/send", response_model=EmailSendResponse)
async def send_email(
    body: EmailSendRequest,
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> EmailSendResponse:
    email_service = request.app.state.email_service
    body_plain = body.body_plain or body.message
    if not body_plain:
        raise HTTPException(status_code=422, detail="Missing email content")

    sender_email = user.email or body.reply_to
    sender_name = _resolve_sender_name(body.sender_name, sender_email)
    from_name = f"{sender_name} via LeadsGrid"
    reply_to = body.reply_to or sender_email

    if not _looks_like_email(body.to):
        raise HTTPException(status_code=422, detail="Invalid recipient email format")

    if reply_to and not _looks_like_email(reply_to):
        raise HTTPException(status_code=422, detail="Invalid reply-to email format")

    if body.backup_to and not _looks_like_email(body.backup_to):
        raise HTTPException(status_code=422, detail="Invalid backup email format")

    custom_args = {
        "user_id": user.user_id,
        "lead_id": body.lead_id,
        "source": "messages_page",
        "template_id": body.template_id,
        "primary_color": body.primary_color,
        "secondary_color": body.secondary_color,
        **body.custom_args,
    }

    result = await email_service.send_email(
        to_email=str(body.to),
        subject=body.subject,
        body_plain=body_plain,
        body_html=body.body_html,
        from_name=from_name,
        reply_to=str(reply_to) if reply_to else None,
        backup_email=str(body.backup_to) if body.backup_to else None,
        attachment=body.attachment.model_dump() if body.attachment else None,
        custom_args=custom_args,
    )

    if result.get("status") == "failed":
        raise HTTPException(status_code=502, detail="Email provider rejected the message")

    sent_at_value = result.get("sentAt")
    try:
        sent_at = datetime.fromisoformat(sent_at_value) if isinstance(sent_at_value, str) else datetime.now(timezone.utc)
    except ValueError:
        sent_at = datetime.now(timezone.utc)

    return EmailSendResponse(
        status=str(result.get("status", "sent")),
        message_id=str(result.get("messageId", "")),
        lead_id=body.lead_id,
        to=body.to,
        subject=body.subject,
        provider=str(result.get("provider", "unknown")),
        sent_at=sent_at,
    )
