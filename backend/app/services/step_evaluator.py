from app.schemas.agent import AgentActionResult, AgentStep, AgentStepEvaluation


class StepEvaluator:
    def evaluate(self, step: AgentStep, result: AgentActionResult) -> AgentStepEvaluation:
        if not result.success:
            return AgentStepEvaluation(
                score=35,
                quality="needs_improvement",
                issues=[result.message or "Execution failed"],
                improvement="Retry with refined prompt or narrower lead set.",
            )

        issues: list[str] = []
        score = 70

        if step.actionType == "lead_discovery":
            count = int(result.data.get("count") or 0)
            if count >= 8:
                score = 90
            elif count >= 4:
                score = 80
            else:
                score = 62
                issues.append("Low lead discovery count")

        elif step.actionType == "lead_scoring":
            scored = result.data.get("scoredLeads")
            scored_count = len(scored) if isinstance(scored, list) else 0
            if scored_count >= 8:
                score = 88
            elif scored_count >= 4:
                score = 78
            else:
                score = 60
                issues.append("Insufficient scored leads")

        elif step.actionType == "crm_update":
            if result.data.get("saved") is True:
                score = 92
            elif result.data.get("reason") == "firebase-disabled":
                score = 68
                issues.append("CRM write simulated; Firebase disabled")
            else:
                score = 74

        elif step.actionType == "message_draft":
            draft = str(result.data.get("draft") or "")
            if len(draft) >= 140:
                score = 90
            elif len(draft) >= 70:
                score = 80
            else:
                score = 64
                issues.append("Draft message is short/generic")

        elif step.actionType == "follow_up_schedule":
            followups = result.data.get("followUps")
            scheduled = len(followups) if isinstance(followups, list) else 0
            if scheduled >= 4:
                score = 88
            elif scheduled >= 2:
                score = 76
            else:
                score = 58
                issues.append("Few follow-ups scheduled")

        quality = "excellent" if score >= 85 else "good" if score >= 70 else "needs_improvement"
        improvement = "Looks strong. Continue to next step."
        if quality == "needs_improvement":
            improvement = "Refine context and retry this step for better precision."

        return AgentStepEvaluation(
            score=score,
            quality=quality,
            issues=issues,
            improvement=improvement,
        )