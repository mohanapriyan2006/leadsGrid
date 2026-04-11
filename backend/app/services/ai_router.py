from datetime import datetime, timezone
from uuid import uuid4

from app.schemas.agent import AgentPlan, AgentStep


class AIRouter:
    def build_plan(self, prompt: str, leads_count: int) -> AgentPlan:
        lower = prompt.lower()
        steps: list[AgentStep] = []

        has_discovery = any(keyword in lower for keyword in ("find", "search", "discover", "lead"))
        has_scoring = any(keyword in lower for keyword in ("score", "rank", "filter", "quality"))
        has_crm = any(keyword in lower for keyword in ("save", "crm", "pipeline", "update", "move", "tag"))
        has_message = any(keyword in lower for keyword in ("message", "email", "outreach", "draft", "send"))
        has_follow_up = any(keyword in lower for keyword in ("follow", "schedule", "remind"))

        def step(label: str, description: str, action_type: str, risk_level: str) -> AgentStep:
            return AgentStep(
                id=str(uuid4()),
                label=label,
                description=description,
                actionType=action_type,
                status="pending",
                riskLevel=risk_level,
            )

        if has_discovery or not any((has_scoring, has_crm, has_message, has_follow_up)):
            steps.append(
                step(
                    "Lead Discovery",
                    f"Discover leads for: {prompt[:72]}",
                    "lead_discovery",
                    "low",
                )
            )

        if has_scoring or has_discovery:
            base_text = str(leads_count) if leads_count else "discovered"
            steps.append(step("Lead Scoring", f"Score and rank {base_text} leads", "lead_scoring", "low"))

        if has_crm or has_discovery:
            steps.append(step("CRM Update", "Save qualified leads to CRM", "crm_update", "medium"))

        if has_message:
            steps.append(step("Message Draft", "Generate personalized outreach", "message_draft", "medium"))

        if has_follow_up:
            steps.append(step("Follow-up Schedule", "Schedule next-touch reminders", "follow_up_schedule", "low"))

        return AgentPlan(
            id=str(uuid4()),
            title=prompt[:80],
            steps=steps,
            createdAt=datetime.now(timezone.utc),
            approved=False,
            approvalMode=None,
        )

    def draft_message(self, lead: dict, tone: str) -> str:
        name = lead.get("author") or lead.get("title") or "there"
        summary = (lead.get("summary") or "your recent post").strip()

        if tone == "friendly":
            return (
                f"Hey {name},\n\n"
                f"I noticed your note about {summary[:120]}. "
                "We help teams convert these kinds of opportunities faster.\n\n"
                "Open to a quick chat this week?"
            )

        if tone == "direct":
            return (
                f"{name},\n\n"
                f"Saw this: {summary[:90]}. We solve this quickly.\n\n"
                "Can we schedule 10 minutes this week?"
            )

        return (
            f"Dear {name},\n\n"
            f"I noticed your recent context around {summary[:120]}. "
            "Our team helps streamline this with an AI-assisted workflow.\n\n"
            "Would you be open to a short discussion this week?\n\n"
            "Best regards"
        )
