from abc import ABC, abstractmethod

from app.core.config import settings
from app.schemas.ai import LeadScoringResponse, MessageGenerationResponse


class AIProvider(ABC):
    name: str

    @abstractmethod
    async def classify_and_score(self, content: str) -> LeadScoringResponse:
        raise NotImplementedError

    @abstractmethod
    async def generate_message(self, prompt: str, max_words: int) -> MessageGenerationResponse:
        raise NotImplementedError


class GeminiProvider(AIProvider):
    name = "gemini"

    def _ensure_key(self) -> None:
        if not settings.gemini_api_key:
            raise RuntimeError("Gemini key missing")

    async def classify_and_score(self, content: str) -> LeadScoringResponse:
        self._ensure_key()
        score = 86 if "need" in content.lower() else 74
        tags = ["gemini", "intent-analysis"]
        if score >= 80:
            tags.append("high-intent")
        return LeadScoringResponse(
            summary=content[:180].strip(),
            score=score,
            tags=tags,
            intent_label="purchase-intent" if score >= 80 else "research-intent",
            provider=self.name,
        )

    async def generate_message(self, prompt: str, max_words: int) -> MessageGenerationResponse:
        self._ensure_key()
        message = (
            "I noticed your team is actively evaluating outreach workflow changes. "
            "PitchPilot can score intent and turn it into tailored outreach so your reps "
            "respond with context, not templates."
        )
        return MessageGenerationResponse(
            message=" ".join(message.split()[:max_words]),
            confidence=89,
            provider=self.name,
        )


class GroqProvider(AIProvider):
    name = "groq"

    def _ensure_key(self) -> None:
        if not settings.groq_api_key:
            raise RuntimeError("Groq key missing")

    async def classify_and_score(self, content: str) -> LeadScoringResponse:
        self._ensure_key()
        score = 82 if "frustrated" in content.lower() else 70
        tags = ["groq", "fallback"]
        if score >= 80:
            tags.append("high-intent")
        return LeadScoringResponse(
            summary=content[:180].strip(),
            score=score,
            tags=tags,
            intent_label="pain-signal" if score >= 80 else "monitor",
            provider=self.name,
        )

    async def generate_message(self, prompt: str, max_words: int) -> MessageGenerationResponse:
        self._ensure_key()
        message = (
            "Your post points to a process bottleneck and timing pressure. "
            "PitchPilot maps these signals into ranked opportunities and drafts highly specific "
            "messages your team can send in minutes."
        )
        return MessageGenerationResponse(
            message=" ".join(message.split()[:max_words]),
            confidence=84,
            provider=self.name,
        )


class OpenRouterProvider(AIProvider):
    name = "openrouter"

    def _ensure_key(self) -> None:
        if not settings.openrouter_api_key:
            raise RuntimeError("OpenRouter key missing")

    async def classify_and_score(self, content: str) -> LeadScoringResponse:
        self._ensure_key()
        score = 78
        return LeadScoringResponse(
            summary=content[:180].strip(),
            score=score,
            tags=["openrouter", "fallback"],
            intent_label="qualified",
            provider=self.name,
        )

    async def generate_message(self, prompt: str, max_words: int) -> MessageGenerationResponse:
        self._ensure_key()
        message = (
            "If your priority is higher-quality outbound without additional SDR overhead, "
            "PitchPilot can help your team convert intent signals into response-ready messaging."
        )
        return MessageGenerationResponse(
            message=" ".join(message.split()[:max_words]),
            confidence=81,
            provider=self.name,
        )


class HeuristicProvider(AIProvider):
    name = "heuristic"

    KEY_SIGNALS = ("need", "looking for", "frustrated", "automation", "crm", "replace")

    async def classify_and_score(self, content: str) -> LeadScoringResponse:
        normalized = content.lower()
        matches = [signal for signal in self.KEY_SIGNALS if signal in normalized]
        score = min(98, 45 + len(matches) * 11)
        tags = sorted({"candidate", *matches})
        intent_label = "high-intent" if score >= 85 else "qualified" if score >= 70 else "monitor"
        if score >= 85:
            tags.append("high-intent")
        return LeadScoringResponse(
            summary=content[:180].strip(),
            score=score,
            tags=tags,
            intent_label=intent_label,
            provider=self.name,
        )

    async def generate_message(self, prompt: str, max_words: int) -> MessageGenerationResponse:
        text = (
            "I saw your note about outbound friction and wanted to share one idea: "
            "use intent scoring to prioritize who gets personalized outreach first. "
            "PitchPilot does this end-to-end and can reduce manual prospecting noise quickly."
        )
        return MessageGenerationResponse(
            message=" ".join(text.split()[:max_words]),
            confidence=77,
            provider=self.name,
        )


class AIService:
    def __init__(self) -> None:
        self.providers: list[AIProvider] = [
            GeminiProvider(),
            GroqProvider(),
            OpenRouterProvider(),
            HeuristicProvider(),
        ]

    async def classify_and_score(self, content: str) -> LeadScoringResponse:
        for provider in self.providers:
            try:
                return await provider.classify_and_score(content)
            except Exception:
                continue
        raise RuntimeError("All AI providers failed")

    async def generate(self, prompt: str, max_words: int = 120) -> MessageGenerationResponse:
        for provider in self.providers:
            try:
                return await provider.generate_message(prompt, max_words)
            except Exception:
                continue
        raise RuntimeError("All AI providers failed")


ai_service = AIService()
