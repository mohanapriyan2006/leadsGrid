import asyncio
import json
import re
from typing import Iterable

import aiohttp

from app.core.config import get_settings
from app.schemas.lead_analysis import (
    AdvancedLeadIntentScore,
    ActionSuggestion,
    FollowUpMessage,
    HyperPersonalizedOutreachMetadata,
    HyperPersonalizedOutreachResponse,
    LeadIntentScore,
    LeadValidation,
    OutreachMessage,
    PortfolioMatch,
)


class AIPromptsService:
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

    def _build_prompt_1_intent_scoring(self, lead_text: str) -> str:
        return f"""You are an expert SaaS sales analyst.

Analyze this lead:

TEXT:
"{lead_text}"

Extract:

1. Intent Score (0-100)
2. Urgency (low / medium / high)
3. Budget Indicator (low / medium / high / unknown)
4. Decision Maker (yes / no / unknown)
5. Pain Point (1 sentence)
6. Lead Type (job / complaint / learning / hiring)

Rules:
- High score only if real buying intent
- Ignore students or tutorials

Return ONLY JSON:
{{
  "score": number,
  "urgency": "",
  "budget": "",
  "decision_maker": "",
  "pain_point": "",
  "lead_type": ""
}}"""

    def _build_prompt_advanced_intent(self, lead_text: str) -> str:
        return f"""You are an elite B2B SaaS sales analyst specializing in identifying high-intent freelance and software development leads.

Analyze the following text:

---
{lead_text}
---

Perform a deep evaluation using these criteria:

1. INTENT STRENGTH (0-100)
- 0-30 -> No intent (learning, curiosity)
- 30-60 -> Mild interest
- 60-80 -> Problem-aware
- 80-100 -> Strong buying intent

2. URGENCY LEVEL
- low -> general discussion
- medium -> problem exists
- high -> immediate need, frustration, deadlines

3. BUYING SIGNALS (detect explicitly or implicitly)
- hiring intent
- dissatisfaction with current solution
- asking for recommendations
- budget mentions
- deadline pressure

4. DECISION-MAKER LIKELIHOOD
- yes -> founder / owner / hiring authority
- no -> student / developer asking help
- unknown

5. PAIN POINT (clear 1-line summary)

6. LEAD CATEGORY
Choose ONE:
- hiring
- problem
- switching
- learning
- discussion

7. QUALITY FILTER
Mark as:
- qualified -> real potential client
- unqualified -> ignore

STRICT RULES:
- Do NOT assume intent without evidence
- Penalize vague or learning-related content
- Reward frustration + urgency + ownership

OUTPUT FORMAT (STRICT JSON ONLY):
{{
    "score": number,
    "urgency": "low|medium|high",
    "buying_signals": ["", ""],
    "decision_maker": "yes|no|unknown",
    "pain_point": "",
    "details": "2-4 concise sentences with analysis reasoning and recommended next step",
    "category": "hiring|problem|switching|learning|discussion",
    "status": "qualified|unqualified"
}}

Return ONLY the JSON object. No markdown, no code fences, no explanation."""

    def _build_prompt_2_filter_bad_leads(self, lead_text: str) -> str:
        return f"""Classify this text:

"{lead_text}"

Is this a REAL BUYING LEAD?

Rules:
- YES → hiring, problem, frustration, need developer
- NO → learning, tutorial, curiosity

Return:
{{
 "is_valid_lead": true/false,
 "reason": ""
}}"""

    def _build_prompt_3_outreach_message(self, lead_text: str, pain_point: str, name: str = "there") -> str:
        return f"""You are a professional freelance developer.

Write a SHORT personalized message.

Lead:
"{lead_text}"

Pain point:
"{pain_point}"

Rules:
- Friendly, not salesy
- Mention solution idea
- Show expertise
- Keep under 80 words
- Address as "Hi {name}," if name provided, else "Hi there,"

Output only the message text, no JSON."""

    def _build_prompt_4_follow_up(self) -> str:
        return """Write a polite follow-up message.

Context:
- Previous message sent 2 days ago
- No reply

Rules:
- Short (max 50 words)
- Friendly reminder
- Not annoying
- No "just following up" clichés

Output only the message text."""

    def _build_prompt_5_action_suggestion(self, lead_text: str, score: int) -> str:
        return f"""Analyze this lead:

"{lead_text}"

Score: {score}

Decide best action:

Options:
- ignore (low quality, not relevant)
- save (good lead, add to CRM)
- contact_now (high intent, reach out immediately)

Return:
{{
 "action": "ignore|save|contact_now",
 "reason": "one sentence explaining why"
}}"""

    def _build_prompt_6_portfolio_matching(self, lead_text: str, user_projects: list[dict]) -> str:
        projects_str = json.dumps(user_projects, indent=2) if user_projects else "[]"
        return f"""Match this lead to the best portfolio project.

Lead:
"{lead_text}"

Portfolio:
{projects_str}

Find the best matching project.

Return:
{{
 "project_name": "name of project or N/A if no match",
 "why_match": "brief explanation of why this project fits"
}}"""

    def _build_prompt_7_hyper_personalized_outreach(
        self,
        lead_text: str,
        pain_point: str,
        user_skills: list[str],
        portfolio_summary: str,
        name: str,
        tone: str,
    ) -> str:
        skills_csv = ", ".join(skill.strip() for skill in user_skills if skill.strip())

        return f"""You are a top-performing freelance developer who consistently wins clients with short, personalized outreach messages.

Generate a highly relevant outreach message for this lead.

LEAD TEXT:
"{lead_text}"

PAIN POINT:
"{pain_point}"

USER SKILLS:
"{skills_csv}"

PORTFOLIO:
"{portfolio_summary}"

TONE:
"{tone}"

INSTRUCTIONS:
1. Start naturally (no "Dear Sir", no generic intros)
2. Show you understand the exact problem
3. Suggest ONE specific solution idea
4. Mention relevant experience subtly
5. Keep under 80 words
6. End with a soft CTA (not pushy)
7. Avoid phrase: "I am interested"
8. Do not use long paragraphs or generic templates

Use "Hi {name}," only if a real name is available, otherwise start naturally without formal greetings.

Return STRICT JSON ONLY:
{{
    "message": "",
    "personalization_score": 0.0,
    "has_soft_cta": true
}}"""

    def _build_prompt_8_outreach_rewrite(
        self,
        message: str,
        pain_point: str,
        user_skills: list[str],
        tone: str,
    ) -> str:
        return f"""Rewrite the outreach message below to satisfy strict constraints.

    Current message:
    "{message}"

    Pain point:
    "{pain_point}"

    Skills:
    "{', '.join(user_skills)}"

    Tone:
    "{tone}"

    Constraints:
    1. Under 80 words
    2. Exactly one short paragraph
    3. Show clear pain-point understanding
    4. Include one specific solution idea
    5. Include a subtle experience signal
    6. End with soft CTA
    7. Avoid phrases: "I am interested", "Dear Sir", "Dear Madam"

    Return STRICT JSON ONLY:
    {{
      "message": "",
      "personalization_score": 0.0,
      "has_soft_cta": true
    }}"""

    async def _call_provider(self, provider: str, prompt: str) -> str:
        if provider == "gemini":
            return await self._call_gemini(prompt)
        return await self._call_groq(prompt)

    def _shorten_text(self, text: str, limit: int = 420) -> str:
        cleaned = re.sub(r"\s+", " ", (text or "").strip())
        if not cleaned:
            return ""
        if len(cleaned) <= limit:
            return cleaned
        return f"{cleaned[: limit - 3].rstrip()}..."

    def _heuristic_advanced_intent(self, lead_text: str) -> AdvancedLeadIntentScore:
        lowered = lead_text.lower()

        high_urgency_tokens = ["urgent", "asap", "immediately", "today", "deadline", "stuck", "frustrated"]
        medium_urgency_tokens = ["need", "looking", "issue", "problem", "help"]
        buying_tokens = [
            "hire",
            "hiring",
            "freelancer",
            "agency",
            "developer",
            "looking for",
            "need someone",
            "recommend",
            "budget",
        ]
        decision_tokens = ["i need", "we need", "founder", "owner", "ceo", "manager", "my team", "our team"]

        detected_signals: list[str] = []
        for token in buying_tokens:
            if token in lowered:
                detected_signals.append(token)

        urgency = "low"
        if any(token in lowered for token in high_urgency_tokens):
            urgency = "high"
        elif any(token in lowered for token in medium_urgency_tokens):
            urgency = "medium"

        decision_maker = "yes" if any(token in lowered for token in decision_tokens) else "unknown"

        category = "discussion"
        if any(token in lowered for token in ["hire", "hiring", "looking for", "need someone"]):
            category = "hiring"
        elif any(token in lowered for token in ["switch", "migrate", "replace", "current solution"]):
            category = "switching"
        elif any(token in lowered for token in ["problem", "issue", "broken", "frustrated", "stuck"]):
            category = "problem"
        elif any(token in lowered for token in ["learn", "tutorial", "course", "beginner", "how to"]):
            category = "learning"

        score = 45
        if category in {"hiring", "problem", "switching"}:
            score += 22
        if urgency == "high":
            score += 20
        elif urgency == "medium":
            score += 10
        if decision_maker == "yes":
            score += 10
        if len(detected_signals) >= 3:
            score += 8

        score = max(0, min(100, score))
        status = "qualified" if score >= 70 and category in {"hiring", "problem", "switching"} else "unqualified"

        pain_point_source = lead_text.strip().replace("\n", " ")
        if not pain_point_source:
            pain_point = "Lead needs help with a business problem."
        elif len(pain_point_source) <= 220:
            pain_point = pain_point_source
        else:
            pain_point = f"{pain_point_source[:217].rstrip()}..."

        unique_signals = []
        for signal in detected_signals:
            if signal not in unique_signals:
                unique_signals.append(signal)

        details = self._shorten_text(
            " ".join(
                [
                    f"Lead classified as {category} with {urgency} urgency.",
                    f"Signals detected: {', '.join(unique_signals[:3]) if unique_signals else 'none explicit'}.",
                    f"Decision-maker likelihood is {decision_maker}.",
                    f"Recommended next step: {'prioritize direct outreach' if status == 'qualified' else 'keep in nurture queue and monitor intent changes' }.",
                ]
            ),
            limit=420,
        )

        return AdvancedLeadIntentScore(
            score=score,
            urgency=urgency,
            buying_signals=unique_signals[:6],
            decision_maker=decision_maker,
            pain_point=pain_point,
            details=details,
            category=category,
            status=status,
        )

    def _fallback_outreach_message(self, pain_point: str, user_skills: list[str], name: str, tone: str) -> str:
        intro = f"Hi {name}," if name and name.strip() and name.strip().lower() != "there" else "Hi there,"
        primary_skill = user_skills[0] if user_skills else "software automation"

        if tone == "direct":
            body = (
                f"I noticed the issue around {pain_point.lower()}. "
                f"I can quickly build a focused {primary_skill} workflow to fix this with minimal disruption. "
                "If useful, I can share a short plan this week."
            )
        elif tone == "professional":
            body = (
                f"I noticed the challenge around {pain_point.lower()}. "
                f"Using {primary_skill}, I can implement a practical workflow to resolve it and improve conversion speed. "
                "If helpful, I can send a concise implementation approach."
            )
        else:
            body = (
                f"I saw the pain point around {pain_point.lower()}. "
                f"I help teams solve this using {primary_skill} and lightweight automation. "
                "If you'd like, I can share a simple approach you can review."
            )

        message = f"{intro} {body}"
        words = [word for word in message.split(" ") if word]
        if len(words) > 80:
            message = " ".join(words[:80]).rstrip(" ,") + "..."
        return message

    def _normalize_outreach_message(self, raw_message: str) -> str:
        message = raw_message.strip()

        if message.startswith("```json"):
            message = message[7:]
        elif message.startswith("```"):
            message = message[3:]
        if message.endswith("```"):
            message = message[:-3]

        message = re.sub(r"\s+", " ", message).strip()

        forbidden_phrases = ["i am interested", "dear sir", "dear madam"]
        for phrase in forbidden_phrases:
            message = re.sub(re.escape(phrase), "", message, flags=re.IGNORECASE).strip(" ,.-")

        return message

    def _evaluate_outreach_constraints(
        self,
        message: str,
        pain_point: str,
        user_skills: list[str],
    ) -> dict:
        words = [word for word in message.split(" ") if word]
        lowered = message.lower()
        pain_keywords = [token.lower() for token in re.findall(r"[a-zA-Z]{4,}", pain_point)]

        has_soft_cta = bool(
            re.search(
                r"\b(let me know|if you'd like|if you want|open to|happy to|would you be open|could we|can share)\b",
                lowered,
            )
        )
        has_pain_alignment = any(keyword in lowered for keyword in pain_keywords[:8]) if pain_keywords else True
        has_solution_idea = bool(re.search(r"\b(i would|i can|we can|you can|recommend|build|implement|set up|create)\b", lowered))
        has_experience_signal = bool(re.search(r"\b(i've|i have|recently|shipped|built|delivered|helped)\b", lowered))
        has_skill_reference = any(skill.lower() in lowered for skill in user_skills if skill.strip()) if user_skills else True
        one_paragraph = "\n" not in message
        within_word_limit = len(words) <= 80

        checks = {
            "one_paragraph": one_paragraph,
            "word_limit_80": within_word_limit,
            "pain_point_alignment": has_pain_alignment,
            "single_solution_idea": has_solution_idea,
            "subtle_experience": has_experience_signal,
            "skill_reference": has_skill_reference,
            "soft_cta": has_soft_cta,
            "forbidden_phrase_filter": all(phrase not in lowered for phrase in ["i am interested", "dear sir", "dear madam"]),
        }

        violations = [name for name, passed in checks.items() if not passed]
        compliance_score = (len(checks) - len(violations)) / len(checks)

        return {
            "checks": checks,
            "violations": violations,
            "compliance_score": max(0.0, min(1.0, compliance_score)),
            "word_count": len(words),
            "has_soft_cta": has_soft_cta,
            "within_word_limit": within_word_limit,
        }

    async def _call_gemini(self, prompt: str) -> str:
        api_key = getattr(self.settings, "gemini_api_key", None)
        if not api_key:
            raise ValueError("Gemini API key not configured")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

        session = await self._ensure_session()
        last_exc: Exception | None = None
        for attempt in range(self.retry_attempts):
            try:
                async with session.post(
                    url,
                    json={
                        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.3, "topP": 0.9},
                    },
                    timeout=aiohttp.ClientTimeout(total=self.timeout_seconds),
                ) as response:
                    if response.status != 200:
                        raise RuntimeError(f"Gemini API error: {response.status}")
                    data = await response.json()
                    return data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            except Exception as exc:  # pragma: no cover - network variability
                last_exc = exc
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_backoff_base * (2 ** attempt))
        raise RuntimeError(f"Gemini API request failed: {last_exc}")

    async def _call_groq(self, prompt: str) -> str:
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
                        "temperature": 0.3,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                    timeout=aiohttp.ClientTimeout(total=self.timeout_seconds),
                ) as response:
                    if response.status != 200:
                        raise RuntimeError(f"Groq API error: {response.status}")
                    data = await response.json()
                    return data.get("choices", [{}])[0].get("message", {}).get("content", "")
            except Exception as exc:  # pragma: no cover - network variability
                last_exc = exc
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_backoff_base * (2 ** attempt))
        raise RuntimeError(f"Groq API request failed: {last_exc}")

    def _extract_json(self, text: str) -> dict:
        text = text.strip()

        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]

        text = text.strip()

        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
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
            parse_candidates.append(cleaned[first_brace:last_brace + 1])

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

        missing_keys = [key for key in required_keys if key not in parsed]
        if missing_keys:
            raise ValueError(f"AI response missing required keys: {', '.join(missing_keys)}")

        return parsed

    async def analyze_intent(self, lead_text: str) -> LeadIntentScore:
        prompt = self._build_prompt_1_intent_scoring(lead_text)

        try:
            response_text = await self._call_gemini(prompt)
        except Exception:
            try:
                response_text = await self._call_groq(prompt)
            except Exception as e:
                raise RuntimeError(f"All AI providers failed for intent analysis: {e}")

        data = self._extract_json(response_text)

        return LeadIntentScore(
            score=max(0, min(100, int(data.get("score", 50)))),
            urgency=data.get("urgency", "unknown"),
            budget=data.get("budget", "unknown"),
            decision_maker=data.get("decision_maker", "unknown"),
            pain_point=data.get("pain_point", ""),
            lead_type=data.get("lead_type", "job"),
        )

    async def analyze_advanced_intent(self, lead_text: str) -> AdvancedLeadIntentScore:
        prompt = self._build_prompt_advanced_intent(lead_text)

        try:
            response_text = await self._call_gemini(prompt)
        except Exception:
            try:
                response_text = await self._call_groq(prompt)
            except Exception as e:
                return self._heuristic_advanced_intent(lead_text)

        try:
            data = self._extract_json_strict(
                response_text,
                required_keys={
                    "score",
                    "urgency",
                    "buying_signals",
                    "decision_maker",
                    "pain_point",
                    "details",
                    "category",
                    "status",
                },
            )
            data["details"] = self._shorten_text(str(data.get("details", "")), limit=420)
            return AdvancedLeadIntentScore.model_validate(data)
        except Exception:
            return self._heuristic_advanced_intent(lead_text)

    async def validate_lead(self, lead_text: str) -> LeadValidation:
        prompt = self._build_prompt_2_filter_bad_leads(lead_text)

        try:
            response_text = await self._call_gemini(prompt)
        except Exception:
            try:
                response_text = await self._call_groq(prompt)
            except Exception as e:
                raise RuntimeError(f"All AI providers failed for validation: {e}")

        data = self._extract_json(response_text)

        return LeadValidation(
            is_valid_lead=data.get("is_valid_lead", True),
            reason=data.get("reason", ""),
        )

    async def generate_outreach(self, lead_text: str, pain_point: str, name: str = "there") -> OutreachMessage:
        prompt = self._build_prompt_3_outreach_message(lead_text, pain_point, name)

        try:
            response_text = await self._call_gemini(prompt)
        except Exception:
            try:
                response_text = await self._call_groq(prompt)
            except Exception as e:
                raise RuntimeError(f"All AI providers failed for outreach: {e}")

        message = response_text.strip()
        if message.startswith("Hi there,") and name != "there":
            message = message.replace("Hi there,", f"Hi {name},", 1)

        return OutreachMessage(message=message)

    async def generate_follow_up(self) -> FollowUpMessage:
        prompt = self._build_prompt_4_follow_up()

        try:
            response_text = await self._call_gemini(prompt)
        except Exception:
            try:
                response_text = await self._call_groq(prompt)
            except Exception as e:
                raise RuntimeError(f"All AI providers failed for follow-up: {e}")

        return FollowUpMessage(message=response_text.strip())

    async def suggest_action(self, lead_text: str, score: int) -> ActionSuggestion:
        prompt = self._build_prompt_5_action_suggestion(lead_text, score)

        try:
            response_text = await self._call_gemini(prompt)
        except Exception:
            try:
                response_text = await self._call_groq(prompt)
            except Exception as e:
                raise RuntimeError(f"All AI providers failed for action suggestion: {e}")

        data = self._extract_json(response_text)

        action = data.get("action", "save")
        if action not in ("ignore", "save", "contact_now"):
            action = "save"

        return ActionSuggestion(
            action=action,
            reason=data.get("reason", "Based on lead analysis"),
        )

    async def match_portfolio(self, lead_text: str, user_projects: list[dict]) -> PortfolioMatch | None:
        if not user_projects:
            return None

        prompt = self._build_prompt_6_portfolio_matching(lead_text, user_projects)

        try:
            response_text = await self._call_gemini(prompt)
        except Exception:
            try:
                response_text = await self._call_groq(prompt)
            except Exception:
                return None

        data = self._extract_json(response_text)

        project_name = data.get("project_name", "")
        if project_name == "N/A" or not project_name:
            return None

        return PortfolioMatch(
            project_name=project_name,
            why_match=data.get("why_match", ""),
        )

    async def generate_hyper_personalized_outreach(
        self,
        lead_text: str,
        pain_point: str,
        user_skills: list[str],
        portfolio_summary: str,
        name: str = "there",
        tone: str = "friendly",
    ) -> HyperPersonalizedOutreachResponse:
        cleaned_skills = [skill.strip() for skill in user_skills if skill and skill.strip()]
        if not cleaned_skills:
            raise ValueError("At least one user skill is required")

        prompt = self._build_prompt_7_hyper_personalized_outreach(
            lead_text=lead_text,
            pain_point=pain_point,
            user_skills=cleaned_skills,
            portfolio_summary=portfolio_summary,
            name=name if name.strip() else "there",
            tone=tone,
        )

        provider = "gemini"
        try:
            response_text = await self._call_gemini(prompt)
        except Exception:
            provider = "groq"
            try:
                response_text = await self._call_groq(prompt)
            except Exception:
                provider = "fallback"
                response_text = json.dumps(
                    {
                        "message": self._fallback_outreach_message(
                            pain_point=pain_point,
                            user_skills=cleaned_skills,
                            name=name,
                            tone=tone,
                        ),
                        "personalization_score": 0.62,
                        "has_soft_cta": True,
                    }
                )

        data = self._extract_json(response_text)

        message = ""
        if isinstance(data, dict):
            message = str(data.get("message", "")).strip()
        if not message:
            message = response_text.strip()

        message = self._normalize_outreach_message(message)
        evaluation = self._evaluate_outreach_constraints(message, pain_point, cleaned_skills)
        rewritten = False

        if evaluation["violations"]:
            rewrite_prompt = self._build_prompt_8_outreach_rewrite(
                message=message,
                pain_point=pain_point,
                user_skills=cleaned_skills,
                tone=tone,
            )
            try:
                rewritten_response_text = await self._call_provider(provider, rewrite_prompt)
                rewritten_data = self._extract_json(rewritten_response_text)
                rewritten_message = ""
                if isinstance(rewritten_data, dict):
                    rewritten_message = str(rewritten_data.get("message", "")).strip()
                if rewritten_message:
                    message = self._normalize_outreach_message(rewritten_message)
                    evaluation = self._evaluate_outreach_constraints(message, pain_point, cleaned_skills)
                    rewritten = True
                    data = rewritten_data
            except Exception:
                pass

        if evaluation["word_count"] > 80:
            trimmed = [word for word in message.split(" ") if word][:80]
            message = " ".join(trimmed).rstrip(" ,") + "..."
            evaluation = self._evaluate_outreach_constraints(message, pain_point, cleaned_skills)

        final_words = [word for word in message.split(" ") if word]
        if not final_words:
            message = self._fallback_outreach_message(
                pain_point=pain_point,
                user_skills=cleaned_skills,
                name=name,
                tone=tone,
            )
            final_words = [word for word in message.split(" ") if word]

        raw_score = 0.85
        if isinstance(data, dict):
            provided_score = data.get("personalization_score", 0.85)
            try:
                raw_score = float(provided_score)
            except (TypeError, ValueError):
                raw_score = 0.85

        if raw_score > 1:
            raw_score = raw_score / 100.0

        personalization_score = max(0.0, min(1.0, raw_score))

        blended_score = max(0.0, min(1.0, (personalization_score * 0.65) + (evaluation["compliance_score"] * 0.35)))

        metadata = HyperPersonalizedOutreachMetadata(
            provider=provider,
            personalization_score=blended_score,
            compliance_score=evaluation["compliance_score"],
            word_count=len(final_words),
            within_word_limit=evaluation["within_word_limit"],
            has_soft_cta=evaluation["has_soft_cta"],
            rewritten=rewritten,
            violations=evaluation["violations"],
            constraints_checked=[
                "one_paragraph",
                "pain_point_alignment",
                "single_solution_idea",
                "subtle_experience",
                "skill_reference",
                "word_limit_80",
                "soft_cta",
                "forbidden_phrase_filter",
            ],
        )

        return HyperPersonalizedOutreachResponse(message=message, metadata=metadata)

    async def full_analysis(
        self,
        lead_text: str,
        user_projects: list[dict],
        score: int = 0,
        name: str = "there",
    ) -> dict:
        intent, validation, follow_up, portfolio_match = await asyncio.gather(
            self.analyze_intent(lead_text),
            self.validate_lead(lead_text),
            self.generate_follow_up(),
            self.match_portfolio(lead_text, user_projects),
        )
        outreach, action = await asyncio.gather(
            self.generate_outreach(lead_text, intent.pain_point, name),
            self.suggest_action(lead_text, intent.score),
        )

        return {
            "intent": intent,
            "validation": validation,
            "outreach": outreach,
            "follow_up": follow_up,
            "action": action,
            "portfolio_match": portfolio_match,
        }


ai_prompts_service = AIPromptsService()
