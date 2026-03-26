from app.schemas.ai import MessageGenerationRequest, MessageGenerationResponse
from app.services.ai_service import ai_service
from app.services.cache_service import cache_service


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


message_service = MessageService()
