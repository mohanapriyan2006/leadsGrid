from __future__ import annotations

from datetime import timedelta
from uuid import uuid4

from app.models.lead import AIAnalysisModel, LeadModel
from app.repositories.manage_lead_repository import manage_lead_repository
from app.schemas.lead import (
    AIAnalysis,
    AutomationRunResult,
    LeadActionRequest,
    LeadListFilters,
    LeadUpdateRequest,
    ManageLead,
    ManageLeadActivity,
    ManageLeadAnalytics,
    ManageLeadInsights,
)
from app.utils.time import utc_now


class ManageLeadService:
    def ensure_seed_data(self) -> None:
        if manage_lead_repository.count() > 0:
            return

        now = utc_now()
        seed = [
            {
                "name": "Ava Reed",
                "company": "Northline Studio",
                "source": "linkedin",
                "stage": "QUALIFIED",
                "score": 91,
                "urgency": "high",
                "budget": 18000,
                "summary": "Need conversion-focused landing pages for B2B launch",
                "analysis": {
                    "pain_points": ["low MQL conversion", "inconsistent pitch messaging"],
                    "pitch": "Position a conversion sprint with measurable weekly wins.",
                    "portfolio": "SaaS conversion redesign",
                    "next": "Schedule pricing call",
                    "prob": 76,
                    "days": 5,
                    "ghost": 18,
                    "strategy": "Mention invoice automation project to increase trust.",
                },
            },
            {
                "name": "Liam Foster",
                "company": "BluePeak Labs",
                "source": "reddit",
                "stage": "CONTACTED",
                "score": 84,
                "urgency": "medium",
                "budget": 12000,
                "summary": "Looking for AI workflow for outbound and lead routing",
                "analysis": {
                    "pain_points": ["manual follow-up", "fragmented CRM"],
                    "pitch": "Offer a staged AI outreach rollout.",
                    "portfolio": "Outbound AI Copilot",
                    "next": "Send follow-up",
                    "prob": 64,
                    "days": 9,
                    "ghost": 32,
                    "strategy": "Lead with fast 2-week implementation roadmap.",
                },
            },
            {
                "name": "Mia Chen",
                "company": "ArcWave Systems",
                "source": "website",
                "stage": "NEGOTIATION",
                "score": 95,
                "urgency": "high",
                "budget": 26000,
                "summary": "Ready to decide vendor for full sales pipeline modernization",
                "analysis": {
                    "pain_points": ["tool sprawl", "pipeline visibility gaps"],
                    "pitch": "Present end-to-end dashboard and automation bundle.",
                    "portfolio": "Enterprise sales command center",
                    "next": "Propose pricing",
                    "prob": 88,
                    "days": 3,
                    "ghost": 9,
                    "strategy": "Reference measurable drop-off recovery outcomes.",
                },
            },
            {
                "name": "Noah Patel",
                "company": "OrbitIQ",
                "source": "linkedin",
                "stage": "NEW_LEADS",
                "score": 67,
                "urgency": "low",
                "budget": 7000,
                "summary": "Exploring options for lead enrichment",
                "analysis": {
                    "pain_points": ["unclear ICP", "slow qualification"],
                    "pitch": "Start with qualification assistant and low-risk pilot.",
                    "portfolio": "Lead qualification assistant",
                    "next": "Send follow-up",
                    "prob": 39,
                    "days": 16,
                    "ghost": 52,
                    "strategy": "Use pilot-first strategy with low upfront cost.",
                },
            },
        ]

        for item in seed:
            lead_id = str(uuid4())
            created_at = now - timedelta(days=4)
            lead = LeadModel(
                id=lead_id,
                source=item["source"],
                name=item["name"],
                company=item["company"],
                stage=item["stage"],
                budget_estimate=item["budget"],
                urgency=item["urgency"],
                email=f"{item['name'].split()[0].lower()}@example.com",
                phone="+1-555-0142",
                content=item["summary"],
                summary=item["summary"],
                score=item["score"],
                tags="ai,lead,automation",
                intent_label="high" if item["score"] >= 85 else "medium",
                last_activity_at=now - timedelta(hours=18),
                notes="Seeded lead for manage pipeline",
                is_going_cold=item["score"] < 75,
                created_at=created_at,
                updated_at=now,
            )
            manage_lead_repository.upsert_lead(lead)

            analysis_payload = item["analysis"]
            manage_lead_repository.upsert_analysis(
                AIAnalysisModel(
                    id=str(uuid4()),
                    lead_id=lead_id,
                    intent_score=item["score"],
                    pain_points=",".join(analysis_payload["pain_points"]),
                    suggested_pitch=analysis_payload["pitch"],
                    portfolio_match=analysis_payload["portfolio"],
                    next_action=analysis_payload["next"],
                    deal_probability=analysis_payload["prob"],
                    expected_close_days=analysis_payload["days"],
                    ghost_probability=analysis_payload["ghost"],
                    winning_strategy=analysis_payload["strategy"],
                    updated_at=now,
                )
            )
            manage_lead_repository.add_activity(
                lead_id,
                "LEAD_CREATED",
                f"Lead captured from {item['source']}",
                now - timedelta(days=3),
            )

    def _to_ai_analysis(self, lead_id: str) -> AIAnalysis:
        row = manage_lead_repository.get_analysis(lead_id)
        if row is None:
            return AIAnalysis(
                intent_score=60,
                pain_points=["unknown pain points"],
                suggested_pitch="Lead with fast implementation and measurable outcomes.",
                portfolio_match="General B2B automation",
                next_action="Send follow-up",
                deal_probability=45,
                expected_close_days=14,
                ghost_probability=40,
                winning_strategy="Focus on timeline and ROI proof points.",
            )
        return AIAnalysis(
            intent_score=row.intent_score,
            pain_points=[p.strip() for p in row.pain_points.split(",") if p.strip()],
            suggested_pitch=row.suggested_pitch,
            portfolio_match=row.portfolio_match,
            next_action=row.next_action,
            deal_probability=row.deal_probability,
            expected_close_days=row.expected_close_days,
            ghost_probability=row.ghost_probability,
            winning_strategy=row.winning_strategy,
        )

    def list_leads(self, filters: LeadListFilters) -> list[ManageLead]:
        self.ensure_seed_data()
        rows = manage_lead_repository.list_leads(filters)
        leads = []
        for row in rows:
            leads.append(
                ManageLead(
                    id=row.id,
                    name=row.name,
                    company=row.company,
                    source=row.source,
                    stage=row.stage,
                    email=row.email,
                    phone=row.phone,
                    budget_estimate=row.budget_estimate,
                    urgency=row.urgency,
                    score=row.score,
                    last_activity_at=row.last_activity_at,
                    created_at=row.created_at,
                    updated_at=row.updated_at,
                    notes=row.notes,
                    is_going_cold=row.is_going_cold,
                    ai_analysis=self._to_ai_analysis(row.id),
                )
            )
        return leads

    def get_lead(self, lead_id: str) -> ManageLead | None:
        self.ensure_seed_data()
        row = manage_lead_repository.get_lead(lead_id)
        if row is None:
            return None
        return ManageLead(
            id=row.id,
            name=row.name,
            company=row.company,
            source=row.source,
            stage=row.stage,
            email=row.email,
            phone=row.phone,
            budget_estimate=row.budget_estimate,
            urgency=row.urgency,
            score=row.score,
            last_activity_at=row.last_activity_at,
            created_at=row.created_at,
            updated_at=row.updated_at,
            notes=row.notes,
            is_going_cold=row.is_going_cold,
            ai_analysis=self._to_ai_analysis(row.id),
        )

    def get_insights(self) -> ManageLeadInsights:
        leads = self.list_leads(LeadListFilters())
        return ManageLeadInsights(
            hot_leads_need_reply=len([lead for lead in leads if lead.score >= 85 and lead.stage in {"QUALIFIED", "CONTACTED", "NEGOTIATION"}]),
            leads_going_cold=len([lead for lead in leads if lead.is_going_cold]),
            leads_likely_to_close=len([lead for lead in leads if lead.ai_analysis.deal_probability >= 70 and lead.stage in {"QUALIFIED", "CONTACTED", "NEGOTIATION"}]),
        )

    def update_lead(self, lead_id: str, payload: LeadUpdateRequest) -> ManageLead | None:
        row = manage_lead_repository.get_lead(lead_id)
        if row is None:
            return None

        previous_stage = row.stage
        if payload.stage is not None:
            row.stage = payload.stage
        if payload.notes is not None:
            row.notes = payload.notes
        if payload.budget_estimate is not None:
            row.budget_estimate = payload.budget_estimate
        if payload.urgency is not None:
            row.urgency = payload.urgency
        if payload.email is not None:
            row.email = payload.email
        if payload.phone is not None:
            row.phone = payload.phone

        row.updated_at = utc_now()
        row.last_activity_at = utc_now()
        updated = manage_lead_repository.upsert_lead(row)

        if payload.stage is not None and payload.stage != previous_stage:
            manage_lead_repository.add_stage_event(
                lead_id=lead_id,
                from_stage=previous_stage,
                to_stage=payload.stage,
                reason=payload.notes,
                created_at=utc_now(),
            )

        if payload.notes:
            manage_lead_repository.add_activity(
                lead_id,
                "NOTE_UPDATED",
                payload.notes,
                utc_now(),
            )

        return self.get_lead(updated.id)

    def perform_action(self, lead_id: str, payload: LeadActionRequest) -> ManageLead | None:
        lead = manage_lead_repository.get_lead(lead_id)
        if lead is None:
            return None

        now = utc_now()
        if payload.action_type == "MOVE_STAGE" and payload.target_stage:
            from_stage = lead.stage
            lead.stage = payload.target_stage
            manage_lead_repository.add_stage_event(lead_id, from_stage, payload.target_stage, payload.note, now)

        if payload.action_type == "SEND_FOLLOW_UP":
            lead.score = min(100, lead.score + 2)
        elif payload.action_type == "PROPOSE_PRICING":
            lead.score = min(100, lead.score + 4)
        elif payload.action_type == "SCHEDULE_CALL":
            lead.score = min(100, lead.score + 3)

        lead.last_activity_at = now
        lead.updated_at = now
        lead.is_going_cold = False
        manage_lead_repository.upsert_lead(lead)

        message = payload.note or payload.action_type.replace("_", " ").title()
        manage_lead_repository.add_activity(lead_id, payload.action_type, message, now)
        return self.get_lead(lead_id)

    def get_timeline(self, lead_id: str) -> list[ManageLeadActivity]:
        return manage_lead_repository.list_activities(lead_id)

    def get_analytics(self) -> ManageLeadAnalytics:
        leads = self.list_leads(LeadListFilters())
        total = len(leads)
        won = len([lead for lead in leads if lead.stage == "WON"])
        lost = len([lead for lead in leads if lead.stage == "LOST"])
        open_pipeline = [lead for lead in leads if lead.stage not in {"WON", "LOST"}]
        pipeline_value = sum(lead.budget_estimate for lead in open_pipeline)
        stage_drop_offs: dict[str, int] = {}
        for stage in ["NEW_LEADS", "QUALIFIED", "CONTACTED", "NEGOTIATION", "WON", "LOST"]:
            stage_drop_offs[stage] = len([lead for lead in leads if lead.stage == stage])

        conversion = round((won / total) * 100, 2) if total else 0.0
        return ManageLeadAnalytics(
            total_leads=total,
            won_count=won,
            lost_count=lost,
            conversion_rate=conversion,
            pipeline_value=pipeline_value,
            stage_drop_offs=stage_drop_offs,
        )

    def run_automations(self) -> AutomationRunResult:
        self.ensure_seed_data()
        leads = self.list_leads(LeadListFilters())
        now = utc_now()
        reminders_due = 0
        follow_ups_generated = 0
        marked_cold = 0

        for lead in leads:
            idle_days = (now - lead.last_activity_at).days
            if idle_days >= 2 and lead.stage in {"QUALIFIED", "CONTACTED", "NEGOTIATION"}:
                reminders_due += 1
                manage_lead_repository.add_activity(
                    lead.id,
                    "FOLLOW_UP_REMINDER",
                    "No reply in 2+ days, reminder queued.",
                    now,
                )
            if idle_days >= 5 and lead.stage in {"QUALIFIED", "CONTACTED", "NEGOTIATION"}:
                follow_ups_generated += 1
                manage_lead_repository.add_activity(
                    lead.id,
                    "AUTO_FOLLOW_UP",
                    "Auto-generated follow-up draft for stale conversation.",
                    now,
                )

            row = manage_lead_repository.get_lead(lead.id)
            if row is None:
                continue
            if idle_days >= 3:
                row.score = max(0, row.score - min(10, idle_days))
            if row.score < 70:
                if not row.is_going_cold:
                    marked_cold += 1
                row.is_going_cold = True
            row.updated_at = now
            manage_lead_repository.upsert_lead(row)

        return AutomationRunResult(
            reminders_due=reminders_due,
            follow_ups_generated=follow_ups_generated,
            leads_marked_cold=marked_cold,
        )


manage_lead_service = ManageLeadService()
