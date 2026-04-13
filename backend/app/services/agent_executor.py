from datetime import datetime, timedelta, timezone
from typing import cast

from app.firebase.firebase_client import FirebaseClient
from app.modules.processors.cleaner import clean_records
from app.modules.processors.scorer import score_records
from app.schemas.agent import AgentActionResult, AgentPlan, AgentRunResponse, AgentStep, LeadItem
from app.services.aggregator import LeadAggregator
from app.services.ai_router import AIRouter
from app.services.email_service import EmailService


class AgentExecutor:
    def __init__(
        self,
        aggregator: LeadAggregator,
        ai_router: AIRouter,
        email_service: EmailService,
        firebase_client: FirebaseClient,
    ):
        self.aggregator = aggregator
        self.ai_router = ai_router
        self.email_service = email_service
        self.firebase_client = firebase_client

    async def build_plan(self, prompt: str, leads: list[LeadItem]) -> AgentPlan:
        return self.ai_router.build_plan(prompt, len(leads))

    async def execute_step(
        self,
        step: AgentStep,
        prompt: str,
        leads: list[LeadItem],
        tone: str,
        user_id: str,
        auto_save: bool,
    ) -> AgentActionResult:
        lead_records = [lead.model_dump() for lead in leads]
        discovered_records: list[dict] | None = None

        async def ensure_source_records() -> list[dict]:
            nonlocal discovered_records
            if lead_records:
                return lead_records
            if discovered_records is None:
                discovered_records = await self.aggregator.discover(prompt)
            return discovered_records

        if step.actionType == "lead_discovery":
            discovered = await self.aggregator.discover(prompt)
            top = discovered[:10]
            return AgentActionResult(
                success=True,
                message=f"Found {len(top)} leads from free sources.",
                data={"leads": top, "count": len(top)},
            )

        if step.actionType == "lead_scoring":
            source_records = await ensure_source_records()
            scored = score_records(clean_records(source_records), prompt)
            ranked = sorted(scored, key=lambda item: float(item.get("score") or 0), reverse=True)
            top = ranked[:10]
            top_lead = top[0] if top else None
            return AgentActionResult(
                success=True,
                message=(
                    f"Scored {len(ranked)} leads. "
                    f"Top: {(top_lead or {}).get('author') or (top_lead or {}).get('title') or 'n/a'}"
                ),
                data={"scoredLeads": ranked, "topLead": top_lead},
            )

        if step.actionType == "crm_update":
            source_records = await ensure_source_records()

            if auto_save:
                save_result = await self.firebase_client.save_leads_async(user_id, source_records)
                if save_result.get("saved"):
                    return AgentActionResult(
                        success=True,
                        message=f"Saved {save_result.get('count', 0)} leads to Firebase CRM.",
                        data=cast(dict, save_result),
                    )

                return AgentActionResult(
                    success=True,
                    message="CRM update simulated (Firebase not configured).",
                    data=cast(dict, save_result),
                )

            return AgentActionResult(
                success=True,
                message="CRM update skipped (autoSave=false).",
                data={"saved": False, "count": 0},
            )

        if step.actionType == "message_draft":
            source_records = await ensure_source_records()

            ranked = sorted(
                source_records,
                key=lambda item: float(item.get("score") or 0),
                reverse=True,
            )
            top_lead = ranked[0] if ranked else None
            if not top_lead:
                return AgentActionResult(success=False, message="No leads available for drafting.", data={})

            draft = self.ai_router.draft_message(top_lead, tone)
            return AgentActionResult(
                success=True,
                message=f"Draft generated for {top_lead.get('author') or top_lead.get('title')}",
                data={
                    "draft": draft,
                    "leadName": top_lead.get("author") or top_lead.get("title"),
                    "leadEmail": top_lead.get("email"),
                },
            )

        if step.actionType == "follow_up_schedule":
            source_records = await ensure_source_records()

            ranked = sorted(
                source_records,
                key=lambda item: float(item.get("score") or 0),
                reverse=True,
            )
            follow_ups = []
            base_date = datetime.now(timezone.utc)
            for index, lead in enumerate(ranked[:5]):
                follow_ups.append(
                    {
                        "id": lead.get("id") or f"follow-{index}",
                        "author": lead.get("author") or lead.get("title"),
                        "followUpDate": (base_date + timedelta(days=index + 1)).date().isoformat(),
                        "reason": "High intent lead" if float(lead.get("score") or 0) >= 80 else "Nurture sequence",
                    }
                )

            return AgentActionResult(
                success=True,
                message=f"Scheduled {len(follow_ups)} follow-ups.",
                data={"followUps": follow_ups},
            )

        return AgentActionResult(success=False, message=f"Unknown action: {step.actionType}", data={})

    async def run_plan(
        self,
        prompt: str,
        leads: list[LeadItem],
        tone: str,
        user_id: str,
        auto_save: bool,
    ) -> AgentRunResponse:
        plan = await self.build_plan(prompt, leads)
        plan.approved = True
        plan.approvalMode = "all"

        results: list[AgentActionResult] = []
        runtime_leads = [lead.model_dump() for lead in leads]
        failed = False

        for index, step in enumerate(plan.steps):
            step.status = "running"

            current_leads = [LeadItem(**lead) for lead in runtime_leads if lead.get("title")]
            result = await self.execute_step(step, prompt, current_leads, tone, user_id, auto_save)
            results.append(result)

            if result.success:
                step.status = "completed"
                step.result = result.message
                leads_from_step = result.data.get("leads")
                scored_from_step = result.data.get("scoredLeads")

                if isinstance(leads_from_step, list):
                    runtime_leads = [lead for lead in leads_from_step if isinstance(lead, dict)]
                elif isinstance(scored_from_step, list):
                    runtime_leads = [lead for lead in scored_from_step if isinstance(lead, dict)]
            else:
                step.status = "failed"
                step.error = result.message
                failed = True
                for rest in plan.steps[index + 1 :]:
                    rest.status = "skipped"
                break

        if plan.steps:
            await self.firebase_client.log_agent_run_async(
                user_id=user_id,
                task=prompt,
                status="failed" if failed else "completed",
                steps=[step.model_dump(mode="json") for step in plan.steps],
            )

        return AgentRunResponse(
            status="failed" if failed else "completed",
            plan=plan,
            results=results,
        )
