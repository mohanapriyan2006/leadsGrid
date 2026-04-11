from app.schemas.agent import AgentContextPreview, EnhancedLeadContext, LeadItem


class ContextEnhancer:
    def _extract_pain_point(self, lead: LeadItem) -> str:
        candidate = (lead.summary or lead.content or lead.title or "").strip()
        if not candidate:
            return "Needs qualification"

        first = candidate.split(".")[0].strip()
        return first[:120] if first else "Needs qualification"

    def _infer_urgency(self, score: float) -> str:
        if score >= 85:
            return "high"
        if score >= 60:
            return "medium"
        return "low"

    def _infer_budget_hint(self, score: float, text: str) -> str:
        lower = text.lower()
        if any(token in lower for token in ("enterprise", "budget", "funded", "series")):
            return "mid-high"
        if score >= 90:
            return "high"
        if score >= 70:
            return "mid"
        if score <= 40:
            return "low"
        return "unknown"

    def _recommended_pitch(self, prompt: str, lead: LeadItem) -> str:
        lower = f"{prompt} {lead.summary} {lead.content}".lower()
        if "hire" in lower or "recruit" in lower:
            return "Talent pipeline acceleration + screening automation"
        if "outreach" in lower or "email" in lower:
            return "Personalized outreach sequence with measurable follow-up"
        if "crm" in lower or "pipeline" in lower:
            return "Pipeline hygiene and stage progression automation"
        return "Discovery call and scoped execution plan"

    def enhance(self, prompt: str, leads: list[LeadItem]) -> AgentContextPreview:
        contexts: list[EnhancedLeadContext] = []

        for lead in leads[:10]:
            score = float(lead.score or 0)
            urgency = self._infer_urgency(score)
            pain_point = self._extract_pain_point(lead)
            budget_hint = self._infer_budget_hint(score, f"{lead.summary} {lead.content}")

            contexts.append(
                EnhancedLeadContext(
                    leadId=lead.id,
                    name=lead.author or "Unknown",
                    company=lead.title,
                    painPoint=pain_point,
                    intentScore=score,
                    urgency=urgency,
                    budgetHint=budget_hint,
                    recommendedPitch=self._recommended_pitch(prompt, lead),
                    priority="high" if score >= 80 else "medium" if score >= 55 else "low",
                )
            )

        top = contexts[0] if contexts else None
        summary = (
            f"Top lead: {top.name} at {top.company} (intent {int(top.intentScore)})."
            if top
            else "No lead context provided yet."
        )

        return AgentContextPreview(leads=contexts, summary=summary)