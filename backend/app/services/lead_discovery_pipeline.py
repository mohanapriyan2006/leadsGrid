import asyncio
import json
import math
import re
from typing import Iterable

import aiohttp

from app.core.config import get_settings
from app.schemas.lead_discovery import (
    DeepScores,
    EnrichedLeadRecord,
    RawSignalInput,
    Stage1Output,
    Stage2Output,
    Stage3Output,
)


class LeadDiscoveryPipeline:
    """3-Stage AI Lead Discovery Pipeline.

    Stage 1 -- Gatekeeper (fast batched classification)
    Stage 2 -- Deep Intelligence (intent, authority, buying stage, scores)
    Stage 3 -- 90-Day Closing Verifier (YES/LIKELY/UNLIKELY/NO)

    Designed to run with <=3 LLM calls per discovery batch (batched prompts).
    """

    def __init__(self):
        self.settings = get_settings()
        self.timeout_seconds = self.settings.ai_timeout_seconds
        self.retry_attempts = max(1, self.settings.ai_retry_attempts)
        self.retry_backoff_base = max(0.0, self.settings.ai_retry_backoff_base_seconds)
        self._session: aiohttp.ClientSession | None = None
        self._session_lock = asyncio.Lock()

    async def _ensure_session(self) -> aiohttp.ClientSession:
        if self._session and not self._session.closed:
            return self._session
        async with self._session_lock:
            if self._session and not self._session.closed:
                return self._session
            self._session = aiohttp.ClientSession()
            return self._session

    async def aclose(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()

    # ------------------------------------------------------------------
    # Prompt builders
    # ------------------------------------------------------------------

    def _build_prompt_stage1_batch(self, signals: list[dict]) -> str:
        lines = []
        for idx, s in enumerate(signals, 1):
            lines.append(f"[{idx}] Title: {s.get('title', '')}\nContent: {s.get('content', '')}")
        posts = "\n---\n".join(lines)
        return (
            "You are the Gatekeeper Agent for an elite B2B Lead Intelligence Engine.\n"
            "Analyze each of the following posts and classify every one into exactly ONE category.\n\n"
            "Categories to KEEP:\n"
            "- HIRING_NOW: Actively looking to hire full-time, part-time, or contract engineers/agencies.\n"
            "- SERVICE_NEEDED: Explicitly looking for a freelancer, agency, developer, or consultant.\n"
            "- BUYING_SOFTWARE: Looking for software, tools, or platform recommendations.\n"
            "- OPERATIONAL_PAIN: Complaining about a current tool breakdown, workflow issues, or competitor failures.\n"
            "- TOOL_SWITCHING: Explicitly asking for migrations, alternatives, or replacements.\n\n"
            "Categories to DROP:\n"
            "- LEARNING_ONLY: Asking how to code, tutorials, seeking architectural feedback for hobby projects.\n"
            "- JOB_SEEKER: People posting their resumes or looking for work.\n"
            "- SPAM: Link drops, promotions, affiliate marketing.\n"
            "- IRRELEVANT: General chatter, memes, news updates.\n\n"
            f"POSTS:\n{posts}\n\n"
            "OUTPUT FORMAT:\n"
            "Return ONLY a valid JSON array. No markdown, no prose.\n"
            '[{"index": 1, "category": "CATEGORY_NAME", "is_actionable_lead": true, "confidence_score": 0.95}, ...]'
        )

    def _build_prompt_stage2_batch(self, signals: list[dict]) -> str:
        lines = []
        for idx, s in enumerate(signals, 1):
            lines.append(
                f"[{idx}] Source: {s.get('source', 'unknown')}\n"
                f"Title: {s.get('title', '')}\n"
                f"Content: {s.get('content', '')}\n"
                f"Comments/Context: {s.get('comments', '')}\n"
                f"Author Meta: {s.get('author', 'Unknown')}"
            )
        posts = "\n---\n".join(lines)
        return (
            "You are an Elite B2B Lead Intelligence Analyst. Extract deep sales signals from these high-intent posts.\n\n"
            f"POSTS:\n{posts}\n\n"
            "For EACH post return:\n"
            "- industry: SaaS|Fintech|Ecommerce|Agency|HealthTech|Other\n"
            "- authority_level: Founder|CEO|CTO|Manager|Developer|Unknown\n"
            "- authority_confidence: 0-100\n"
            "- buying_stage: PROBLEM_AWARE|SOLUTION_AWARE|COMPARISON|READY_TO_BUY\n"
            "- scores: {intent_score (0-100), urgency_score (0-100), budget_score (0-100)}\n"
            "- primary_problem: Clear 1-sentence breakdown\n"
            "- secondary_problems: list of strings (can be empty)\n"
            "- desired_outcome: What success looks like\n"
            "- evidence_logs: list of exact evidence strings\n\n"
            "OUTPUT FORMAT:\n"
            "Return ONLY a valid JSON array. No markdown, no prose.\n"
            '[{"index": 1, "industry": "...", "authority_level": "...", ...}, ...]'
        )

    def _build_prompt_stage3_batch(self, summaries: list[dict]) -> str:
        lines = []
        for idx, s in enumerate(summaries, 1):
            lines.append(
                f"[{idx}] Problem: {s.get('primary_problem', '')}\n"
                f"Stage: {s.get('buying_stage', '')}\n"
                f"Scores: intent={s.get('intent_score', 0)}, urgency={s.get('urgency_score', 0)}, budget={s.get('budget_score', 0)}"
            )
        leads = "\n---\n".join(lines)
        return (
            "You are a hard-nosed Sales Director. Review each extracted lead summary.\n"
            "Can this lead realistically turn into a paying customer or hire a service provider within 90 days?\n\n"
            f"LEADS:\n{leads}\n\n"
            "OUTPUT FORMAT:\n"
            "Return ONLY a valid JSON array. No markdown, no prose.\n"
            '[{"index": 1, "verdict": "YES|LIKELY|UNLIKELY|NO", "closing_confidence": 0-100, "recommended_action": "..."}, ...]'
        )

    # ------------------------------------------------------------------
    # LLM caller (Groq first -> Gemini fallback)
    # ------------------------------------------------------------------

    async def _call_llm_json(self, prompt: str, system_instruction: str) -> dict:
        try:
            return await self._call_groq_json(prompt, system_instruction)
        except Exception:
            try:
                return await self._call_gemini_json(prompt, system_instruction)
            except Exception as e:
                raise RuntimeError(f"All AI providers failed: {e}")

    async def _call_groq_json(self, prompt: str, system_instruction: str) -> dict:
        api_key = getattr(self.settings, "groq_api_key", None)
        if not api_key:
            raise ValueError("Groq API key not configured")
        session = await self._ensure_session()
        last_exc: Exception | None = None
        for attempt in range(self.retry_attempts):
            try:
                async with session.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": getattr(self.settings, "groq_model", "llama-3.1-8b-instant"),
                        "temperature": 0.1,
                        "messages": [
                            {"role": "system", "content": system_instruction},
                            {"role": "user", "content": prompt},
                        ],
                        "response_format": {"type": "json_object"},
                    },
                    timeout=aiohttp.ClientTimeout(total=self.timeout_seconds),
                ) as response:
                    if response.status != 200:
                        raise RuntimeError(f"Groq API error: {response.status}")
                    data = await response.json()
                    raw = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
                    return self._extract_json(raw)
            except Exception as exc:
                last_exc = exc
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_backoff_base * (2 ** attempt))
        raise RuntimeError(f"Groq request failed: {last_exc}")

    async def _call_gemini_json(self, prompt: str, system_instruction: str) -> dict:
        api_key = getattr(self.settings, "gemini_api_key", None)
        if not api_key:
            raise ValueError("Gemini API key not configured")
        session = await self._ensure_session()
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-1.5-flash:generateContent?key={api_key}"
        )
        last_exc: Exception | None = None
        combined = f"{system_instruction}\n\n{prompt}"
        for attempt in range(self.retry_attempts):
            try:
                async with session.post(
                    url,
                    json={
                        "contents": [{"role": "user", "parts": [{"text": combined}]}],
                        "generationConfig": {"temperature": 0.1, "topP": 0.9},
                    },
                    timeout=aiohttp.ClientTimeout(total=self.timeout_seconds),
                ) as response:
                    if response.status != 200:
                        raise RuntimeError(f"Gemini API error: {response.status}")
                    data = await response.json()
                    raw = (
                        data.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text", "{}")
                    )
                    return self._extract_json(raw)
            except Exception as exc:
                last_exc = exc
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_backoff_base * (2 ** attempt))
        raise RuntimeError(f"Gemini request failed: {last_exc}")

    # ------------------------------------------------------------------
    # JSON helpers
    # ------------------------------------------------------------------

    def _extract_json(self, text: str) -> dict:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        json_match = re.search(r"\{.*\}", text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        arr_match = re.search(r"\[.*\]", text, re.DOTALL)
        if arr_match:
            try:
                return json.loads(arr_match.group())
            except json.JSONDecodeError:
                pass
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        return {}

    def _extract_json_strict(self, text: str, required_keys: Iterable[str]) -> dict:
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        parse_candidates = [cleaned]
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            parse_candidates.append(cleaned[first_brace : last_brace + 1])
        parsed: dict | None = None
        for candidate in parse_candidates:
            try:
                loaded = json.loads(candidate)
            except json.JSONDecodeError:
                continue
            if isinstance(loaded, dict):
                parsed = loaded
                break
        if parsed is None:
            raise ValueError("AI response is not valid JSON")
        missing = [k for k in required_keys if k not in parsed]
        if missing:
            raise ValueError(f"AI response missing required keys: {', '.join(missing)}")
        return parsed

    # ------------------------------------------------------------------
    # Multi-signal scoring math
    # ------------------------------------------------------------------

    def _compute_final_score(
        self,
        scores: DeepScores,
        authority_level: str,
        engagement_upvotes: int,
        freshness_hours: float,
    ) -> int:
        intent_part = scores.intent_score * 0.40
        urgency_part = scores.urgency_score * 0.20
        auth_map = {
            "Founder": 100, "CEO": 100, "CTO": 100, "Co-Founder": 100,
            "VP": 90, "Director": 85, "Manager": 70, "Team Lead": 60,
            "Developer": 40, "Employee": 35, "Student": 20, "Unknown": 30,
        }
        authority_score = auth_map.get(authority_level, 30)
        authority_part = authority_score * 0.20
        engagement_score = min(100, int((math.log(engagement_upvotes + 1, 2)) * 20))
        engagement_part = engagement_score * 0.10
        freshness_score = max(0, int(100 - (freshness_hours * 2)))
        freshness_part = freshness_score * 0.10
        return int(intent_part + urgency_part + authority_part + engagement_part + freshness_part)

    @staticmethod
    def _priority_from_score(score: int) -> str:
        if score >= 85:
            return "HOT"
        if score >= 70:
            return "HIGH"
        if score >= 50:
            return "MEDIUM"
        return "LOW"

    # ------------------------------------------------------------------
    # Heuristic fallbacks
    # ------------------------------------------------------------------

    def _heuristic_stage1(self, signal: dict) -> Stage1Output:
        lowered = f"{signal.get('title', '')} {signal.get('content', '')}".lower()
        negative = ["learn", "tutorial", "course", "beginner", "how to", "student", "job seeker", "resume", "hiring me"]
        spam = ["click here", "affiliate", "promo", "discount code", "buy now"]
        if any(t in lowered for t in spam):
            return Stage1Output(category="SPAM", is_actionable_lead=False, confidence_score=0.95)
        if any(t in lowered for t in negative):
            return Stage1Output(category="LEARNING_ONLY", is_actionable_lead=False, confidence_score=0.85)
        if any(t in lowered for t in ["hire", "hiring", "looking for", "need someone", "freelancer", "agency", "developer"]):
            return Stage1Output(category="HIRING_NOW", is_actionable_lead=True, confidence_score=0.80)
        if any(t in lowered for t in ["switch", "migrate", "replace", "alternative to"]):
            return Stage1Output(category="TOOL_SWITCHING", is_actionable_lead=True, confidence_score=0.75)
        if any(t in lowered for t in ["problem", "issue", "broken", "frustrated", "failing"]):
            return Stage1Output(category="OPERATIONAL_PAIN", is_actionable_lead=True, confidence_score=0.70)
        return Stage1Output(category="IRRELEVANT", is_actionable_lead=False, confidence_score=0.60)

    def _heuristic_stage2(self, signal: dict) -> Stage2Output:
        lowered = f"{signal.get('title', '')} {signal.get('content', '')}".lower()
        high_urgency = ["urgent", "asap", "immediately", "today", "deadline", "stuck", "frustrated"]
        medium_urgency = ["need", "looking", "issue", "problem", "help"]
        urgency = "low"
        if any(t in lowered for t in high_urgency):
            urgency = "high"
        elif any(t in lowered for t in medium_urgency):
            urgency = "medium"
        intent_score = 60 if any(t in lowered for t in ["hire", "hiring", "need", "looking for"]) else 40
        urgency_score = 80 if urgency == "high" else (50 if urgency == "medium" else 20)
        budget_score = 70 if any(t in lowered for t in ["budget", "agency", "freelancer", "paid", "$"]) else 40
        return Stage2Output(
            industry="Other",
            authority_level="Unknown",
            authority_confidence=30,
            buying_stage="PROBLEM_AWARE",
            scores=DeepScores(intent_score=intent_score, urgency_score=urgency_score, budget_score=budget_score),
            primary_problem=(signal.get("content", "")[:140] if signal.get("content") else "Business pain point detected."),
            secondary_problems=[],
            desired_outcome="Resolve the stated problem efficiently.",
            evidence_logs=["Heuristic fallback due to AI provider failure."],
        )

    def _heuristic_stage3(self, stage2: Stage2Output) -> Stage3Output:
        if stage2.scores.intent_score >= 70 and stage2.scores.budget_score >= 50:
            return Stage3Output(verdict="LIKELY", closing_confidence=70, recommended_action="Send targeted outreach now.")
        if stage2.scores.intent_score >= 50:
            return Stage3Output(verdict="LIKELY", closing_confidence=55, recommended_action="Add to nurture sequence.")
        return Stage3Output(verdict="UNLIKELY", closing_confidence=30, recommended_action="Monitor for intent changes.")

    # ------------------------------------------------------------------
    # Core pipeline (batched)
    # ------------------------------------------------------------------

    async def run_pipeline_batch(self, raw_signals: list[dict]) -> list[EnrichedLeadRecord]:
        if not raw_signals:
            return []
        s1_results = await self._stage1_batch(raw_signals)
        survivors = [(sig, s1) for sig, s1 in zip(raw_signals, s1_results) if s1.is_actionable_lead]
        if not survivors:
            return [self._build_dropped_record(sig, s1) for sig, s1 in zip(raw_signals, s1_results)]
        survivor_signals, survivor_s1 = zip(*survivors)
        s2_results = await self._stage2_batch(list(survivor_signals))
        s3_results = await self._stage3_batch(s2_results)
        enriched_by_idx: dict[int, EnrichedLeadRecord] = {}
        for sig, s1, s2, s3 in zip(survivor_signals, survivor_s1, s2_results, s3_results):
            if s3.verdict in {"UNLIKELY", "NO"}:
                enriched_by_idx[raw_signals.index(sig)] = self._build_dropped_record(sig, s1, s2, s3)
            else:
                enriched_by_idx[raw_signals.index(sig)] = self._build_enriched_record(sig, s1, s2, s3)
        for idx, (sig, s1) in enumerate(zip(raw_signals, s1_results)):
            if idx not in enriched_by_idx:
                enriched_by_idx[idx] = self._build_dropped_record(sig, s1)
        return [enriched_by_idx[i] for i in range(len(raw_signals))]

    async def process_single_signal(self, signal: dict) -> EnrichedLeadRecord:
        """Process a single raw signal through the full pipeline."""
        results = await self.run_pipeline_batch([signal])
        return results[0]

    # ------------------------------------------------------------------
    # Stage implementations
    # ------------------------------------------------------------------

    async def _stage1_batch(self, signals: list[dict]) -> list[Stage1Output]:
        prompt = self._build_prompt_stage1_batch(signals)
        try:
            data = await self._call_llm_json(prompt, "You are the Gatekeeper Agent. Return ONLY raw JSON.")
        except Exception:
            return [self._heuristic_stage1(s) for s in signals]
        results: list[Stage1Output] = []
        arr = data if isinstance(data, list) else data.get("results", [])
        for item in arr:
            if not isinstance(item, dict):
                continue
            results.append(Stage1Output(
                category=item.get("category", "IRRELEVANT"),
                is_actionable_lead=bool(item.get("is_actionable_lead", False)),
                confidence_score=float(item.get("confidence_score", 0.0)),
            ))
        while len(results) < len(signals):
            results.append(self._heuristic_stage1(signals[len(results)]))
        return results[: len(signals)]

    async def _stage2_batch(self, signals: list[dict]) -> list[Stage2Output]:
        prompt = self._build_prompt_stage2_batch(signals)
        try:
            data = await self._call_llm_json(prompt, "You are an Elite B2B Lead Intelligence Analyst. Return ONLY raw JSON.")
        except Exception:
            return [self._heuristic_stage2(s) for s in signals]
        results: list[Stage2Output] = []
        arr = data if isinstance(data, list) else data.get("results", [])
        for item in arr:
            if not isinstance(item, dict):
                continue
            scores = item.get("scores", {})
            results.append(Stage2Output(
                industry=item.get("industry", "Other"),
                authority_level=item.get("authority_level", "Unknown"),
                authority_confidence=int(item.get("authority_confidence", 0)),
                buying_stage=item.get("buying_stage", "PROBLEM_AWARE"),
                scores=DeepScores(
                    intent_score=int(scores.get("intent_score", 50)),
                    urgency_score=int(scores.get("urgency_score", 50)),
                    budget_score=int(scores.get("budget_score", 50)),
                ),
                primary_problem=item.get("primary_problem", ""),
                secondary_problems=item.get("secondary_problems", []),
                desired_outcome=item.get("desired_outcome", ""),
                evidence_logs=item.get("evidence_logs", []),
            ))
        while len(results) < len(signals):
            results.append(self._heuristic_stage2(signals[len(results)]))
        return results[: len(signals)]

    async def _stage3_batch(self, stage2_outputs: list[Stage2Output]) -> list[Stage3Output]:
        summaries = [
            {
                "primary_problem": s.primary_problem,
                "buying_stage": s.buying_stage,
                "intent_score": s.scores.intent_score,
                "urgency_score": s.scores.urgency_score,
                "budget_score": s.scores.budget_score,
            }
            for s in stage2_outputs
        ]
        prompt = self._build_prompt_stage3_batch(summaries)
        try:
            data = await self._call_llm_json(prompt, "You are a Sales Director validating lead conversion viability. Return ONLY raw JSON.")
        except Exception:
            return [self._heuristic_stage3(s) for s in stage2_outputs]
        results: list[Stage3Output] = []
        arr = data if isinstance(data, list) else data.get("results", [])
        for item in arr:
            if not isinstance(item, dict):
                continue
            results.append(Stage3Output(
                verdict=item.get("verdict", "LIKELY"),
                closing_confidence=int(item.get("closing_confidence", 60)),
                recommended_action=item.get("recommended_action", "Send personalized outreach focusing on their primary pain point."),
            ))
        while len(results) < len(stage2_outputs):
            results.append(self._heuristic_stage3(stage2_outputs[len(results)]))
        return results[: len(stage2_outputs)]

    # ------------------------------------------------------------------
    # Record builders
    # ------------------------------------------------------------------

    def _build_enriched_record(
        self,
        signal: dict,
        s1: Stage1Output,
        s2: Stage2Output,
        s3: Stage3Output,
    ) -> EnrichedLeadRecord:
        final_score = self._compute_final_score(
            s2.scores,
            s2.authority_level,
            signal.get("engagement_upvotes", 0),
            signal.get("freshness_hours", 1.0),
        )
        return EnrichedLeadRecord(
            source=signal.get("source", "unknown"),
            title=signal.get("title", ""),
            content=signal.get("content", ""),
            author=signal.get("author", "Unknown"),
            permalink=signal.get("permalink"),
            created_at=signal.get("created_at"),
            engagement_upvotes=signal.get("engagement_upvotes", 0),
            freshness_hours=signal.get("freshness_hours", 1.0),
            ai_enriched=True,
            ai_dropped=False,
            lead_category=s1.category,
            is_actionable_lead=s1.is_actionable_lead,
            stage1_confidence=s1.confidence_score,
            industry=s2.industry,
            authority_level=s2.authority_level,
            authority_confidence=s2.authority_confidence,
            buying_stage=s2.buying_stage,
            primary_problem=s2.primary_problem,
            secondary_problems=list(s2.secondary_problems),
            desired_outcome=s2.desired_outcome,
            evidence=list(s2.evidence_logs),
            verdict=s3.verdict,
            closing_confidence=s3.closing_confidence,
            recommended_action=s3.recommended_action,
            lead_score=final_score,
            priority=self._priority_from_score(final_score),
            raw_score=signal.get("score"),
        )

    def _build_dropped_record(
        self,
        signal: dict,
        s1: Stage1Output,
        s2: Stage2Output | None = None,
        s3: Stage3Output | None = None,
    ) -> EnrichedLeadRecord:
        drop = (
            f"Stage 3: {s3.verdict}" if s3 else (f"Stage 1: {s1.category}" if not s1.is_actionable_lead else "Pipeline drop")
        )
        return EnrichedLeadRecord(
            source=signal.get("source", "unknown"),
            title=signal.get("title", ""),
            content=signal.get("content", ""),
            author=signal.get("author", "Unknown"),
            permalink=signal.get("permalink"),
            created_at=signal.get("created_at"),
            engagement_upvotes=signal.get("engagement_upvotes", 0),
            freshness_hours=signal.get("freshness_hours", 1.0),
            ai_enriched=s2 is not None,
            ai_dropped=True,
            drop_reason=drop,
            lead_category=s1.category,
            is_actionable_lead=False,
            stage1_confidence=s1.confidence_score,
            industry=s2.industry if s2 else None,
            authority_level=s2.authority_level if s2 else None,
            authority_confidence=s2.authority_confidence if s2 else None,
            buying_stage=s2.buying_stage if s2 else None,
            primary_problem=s2.primary_problem if s2 else None,
            secondary_problems=list(s2.secondary_problems) if s2 else [],
            desired_outcome=s2.desired_outcome if s2 else None,
            evidence=list(s2.evidence_logs) if s2 else [],
            verdict=s3.verdict if s3 else None,
            closing_confidence=s3.closing_confidence if s3 else None,
            recommended_action=s3.recommended_action if s3 else None,
            lead_score=0,
            priority="LOW",
            raw_score=signal.get("score"),
        )


lead_discovery_pipeline = LeadDiscoveryPipeline()
