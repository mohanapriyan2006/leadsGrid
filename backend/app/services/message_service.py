from app.schemas.ai import MessageGenerationRequest, MessageGenerationResponse
from app.schemas.message import SendEmailRequest, SendEmailResponse
from app.services.email_service import EmailDeliveryError, email_service
from app.services.ai_service import ai_service
from app.services.cache_service import cache_service
from app.repositories.manage_lead_repository import manage_lead_repository
from app.repositories.message_repository import message_repository
from app.utils.time import utc_now


class MessageService:
    async def generate_outreach(self, payload: MessageGenerationRequest) -> MessageGenerationResponse:
        cache_key = f"message:{payload.tone}:{payload.max_words}:{payload.lead_context.lower()}"
        cached = cache_service.get_json(cache_key)
        if isinstance(cached, dict):
            return MessageGenerationResponse.model_validate(cached)

        prompt = self._build_prompt(payload.lead_context, payload.tone, payload.max_words)

        draft = await ai_service.generate(prompt, max_words=payload.max_words)
        evaluation = self._evaluate_message(draft.message, payload.max_words)
        improved_prompt = (
            f"Improve this outreach draft using the evaluation notes.\n"
            f"Draft: {draft.message}\n"
            f"Evaluation: {evaluation}\n"
            f"Max words: {payload.max_words}."
        )
        improved = await ai_service.generate(improved_prompt, max_words=payload.max_words)

        final_message = MessageGenerationResponse(
            message=improved.message,
            confidence=min(99, int((draft.confidence + improved.confidence) / 2) + 4),
            provider=improved.provider,
            draft=draft.message,
            evaluation=evaluation,
        )
        cache_service.set_json(cache_key, final_message.model_dump(mode="json"), ttl_seconds=300)
        return final_message

    def _build_prompt(self, lead_context: str, tone: str, max_words: int) -> str:
        return (
            "ROLE: You are a senior freelance sales engineer.\n"
            "TASK: Analyze the lead and generate a high-conversion outreach message.\n"
            f"TONE: {tone}.\n"
            f"MAX_WORDS: {max_words}.\n"
            "RULES: Mention exact problem, suggest one solution, avoid generic lines.\n"
            f"LEAD_CONTEXT: {lead_context}"
        )

    def _evaluate_message(self, message: str, max_words: int) -> str:
        words = message.split()
        issues: list[str] = []
        if len(words) > max_words:
            issues.append("too long")
        if "PitchPilot" not in message:
            issues.append("product not referenced")
        if "you" not in message.lower():
            issues.append("low personalization")

        if not issues:
            return "Strong draft: concise, contextual, and action-oriented."
        return "Needs improvement: " + ", ".join(issues) + "."

    def send_and_track(self, payload: SendEmailRequest) -> SendEmailResponse:
        lead = manage_lead_repository.get_lead(payload.lead_id)
        if lead is None or lead.is_deleted:
            raise ValueError("Lead not found")

        now = utc_now()

        try:
            email_service.send_email(payload.to, payload.subject, payload.message)
            message = message_repository.create(
                lead_id=payload.lead_id,
                email=payload.to,
                subject=payload.subject,
                content=payload.message,
                status="sent",
                provider="smtp",
                created_at=now,
            )
        except EmailDeliveryError as exc:
            message_repository.create(
                lead_id=payload.lead_id,
                email=payload.to,
                subject=payload.subject,
                content=payload.message,
                status="failed",
                provider="smtp",
                created_at=now,
                error_message=str(exc),
            )
            raise

        previous_stage = lead.stage
        if lead.stage != "CONTRACTED":
            lead.stage = "CONTACTED"
        lead.email = payload.to
        lead.last_activity_at = now
        lead.updated_at = now
        lead.is_going_cold = False
        manage_lead_repository.upsert_lead(lead)

        if previous_stage != lead.stage:
            manage_lead_repository.add_stage_event(
                lead_id=lead.id,
                from_stage=previous_stage,
                to_stage=lead.stage,
                reason="Email sent",
                created_at=now,
            )

        manage_lead_repository.add_activity(
            lead.id,
            "EMAIL_SENT",
            f"Outbound email sent: {payload.subject}",
            now,
        )

        return SendEmailResponse(
            status="success",
            message_id=message.id,
            lead_id=payload.lead_id,
            to=payload.to,
            subject=payload.subject,
            provider=message.provider,
            sent_at=message.created_at,
        )


message_service = MessageService()
