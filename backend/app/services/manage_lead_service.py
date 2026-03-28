from __future__ import annotations

import csv
from datetime import datetime, timedelta
from io import StringIO
from uuid import uuid4

from app.models.lead import AIAnalysisModel, LeadModel
from app.repositories.manage_lead_repository import manage_lead_repository
from app.schemas.lead import (
    AIAnalysis,
    AutomationRunResult,
    BinLead,
    BulkLeadActionRequest,
    CreateLeadRequest,
    CSVImportRequest,
    CSVImportResult,
    LeadActionRequest,
    LeadListFilters,
    LeadStage,
    LeadUpdateRequest,
    ManageLead,
    ManageLeadActivity,
    ManageLeadAnalytics,
    ManageLeadInsights,
)
from app.services.crm_service import crm_service
from app.utils.time import utc_now


HEADER_ALIASES: dict[str, str] = {
    "name": "name",
    "lead_name": "name",
    "client_name": "name",
    "person_name": "name",
    "business_name": "company",
    "company": "company",
    "company_name": "company",
    "org": "company",
    "organization": "company",
    "email": "email",
    "mail": "email",
    "email_address": "email",
    "phone": "phone",
    "phone_number": "phone",
    "mobile": "phone",
    "contact": "phone",
    "stage": "stage",
    "status": "stage",
    "pipeline_stage": "stage",
    "score": "score",
    "ai_score": "score",
    "budget": "budget_estimate",
    "budget_estimate": "budget_estimate",
    "deal_size": "budget_estimate",
    "urgency": "urgency",
    "priority": "urgency",
    "source": "source",
    "platform_source": "source",
    "last_activity": "last_activity_at",
    "last_activity_at": "last_activity_at",
}

STAGE_ALIASES: dict[str, LeadStage] = {
    "new": "NEW",
    "new_leads": "NEW",
    "new lead": "NEW",
    "qualified": "QUALIFIED",
    "contacted": "CONTACTED",
    "responded": "RESPONDED",
    "negotiation": "RESPONDED",
    "contracted": "CONTRACTED",
    "won": "CONTRACTED",
    "crm": "CONTRACTED",
}

SOURCE_ALIASES: dict[str, str] = {
    "reddit": "reddit",
    "linkedin": "linkedin",
    "website": "website",
    "google": "website",
    "google_maps": "website",
    "web": "website",
}


class ManageLeadService:
    def ensure_seed_data(self) -> None:
        if manage_lead_repository.count_active() > 0:
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
                "stage": "RESPONDED",
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
                phone="+91 9000000000",
                content=item["summary"],
                summary=item["summary"],
                score=item["score"],
                tags="ai,lead,automation",
                intent_label="high" if item["score"] >= 85 else "medium",
                last_activity_at=now - timedelta(hours=18),
                notes="Seeded lead for manage pipeline",
                is_going_cold=item["score"] < 75,
                is_deleted=False,
                deleted_at=None,
                created_at=created_at,
                updated_at=now,
            )
            manage_lead_repository.create_lead(lead)

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

    def _normalize_header(self, raw: str) -> str:
        cleaned = "".join(ch.lower() if ch.isalnum() else "_" for ch in raw.strip())
        while "__" in cleaned:
            cleaned = cleaned.replace("__", "_")
        return cleaned.strip("_")

    def _normalize_stage(self, raw: str | None) -> LeadStage:
        if not raw:
            return "NEW"
        normalized = self._normalize_header(raw)
        return STAGE_ALIASES.get(normalized, "NEW")

    def _normalize_source(self, raw: str | None) -> str:
        if not raw:
            return "website"
        normalized = self._normalize_header(raw)
        return SOURCE_ALIASES.get(normalized, "website")

    def _normalize_urgency(self, raw: str | None) -> str:
        if not raw:
            return "medium"
        normalized = self._normalize_header(raw)
        if normalized in {"low", "medium", "high"}:
            return normalized
        return "medium"

    def _parse_budget(self, raw: str | None) -> int:
        if not raw:
            return 0
        digits = "".join(ch for ch in str(raw) if ch.isdigit())
        if not digits:
            return 0
        return int(digits)

    def _parse_score(self, raw: str | None) -> int:
        if not raw:
            return 60
        try:
            score = int(float(raw))
        except (TypeError, ValueError):
            return 60
        return max(0, min(100, score))

    def _parse_dt(self, raw: str | None) -> datetime:
        if not raw:
            return utc_now()
        try:
            return datetime.fromisoformat(raw)
        except ValueError:
            return utc_now()

    def _to_ai_analysis(self, lead_id: str) -> AIAnalysis:
        row = manage_lead_repository.get_analysis(lead_id)
        if row is None:
            return AIAnalysis(
                intent_score=60,
                pain_points=["unknown pain points"],
                suggested_pitch="Lead with clear ROI and timeline.",
                portfolio_match="General conversion systems",
                next_action="Send follow-up",
                deal_probability=45,
                expected_close_days=14,
                ghost_probability=40,
                winning_strategy="Mention a proof-backed outcome story.",
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

    def _to_manage_lead(self, row: LeadModel) -> ManageLead:
        stage = row.stage if row.stage in {"NEW", "QUALIFIED", "CONTACTED", "RESPONDED", "CONTRACTED"} else "NEW"
        source = row.source if row.source in {"reddit", "linkedin", "website"} else "website"
        urgency = row.urgency if row.urgency in {"low", "medium", "high"} else "medium"
        return ManageLead(
            id=row.id,
            name=row.name,
            company=row.company,
            source=source,
            stage=stage,
            email=row.email,
            phone=row.phone,
            budget_estimate=row.budget_estimate,
            urgency=urgency,
            score=row.score,
            last_activity_at=row.last_activity_at,
            created_at=row.created_at,
            updated_at=row.updated_at,
            notes=row.notes,
            is_going_cold=row.is_going_cold,
            is_deleted=row.is_deleted,
            deleted_at=row.deleted_at,
            ai_analysis=self._to_ai_analysis(row.id),
        )

    def _sync_to_crm_if_contracted(self, lead: LeadModel, note: str | None = None) -> None:
        if lead.stage != "CONTRACTED" or lead.is_deleted:
            return
        crm_service.upsert_contracted_record(
            lead.id,
            note=note or f"Auto moved to CRM from Manage Leads ({lead.name})",
        )
        now = utc_now()
        manage_lead_repository.add_activity(
            lead.id,
            "AUTO_MOVED_TO_CRM",
            "Lead reached CONTRACTED and was synced to CRM.",
            now,
        )
        manage_lead_repository.soft_delete(lead.id, now)

    def list_leads(self, filters: LeadListFilters) -> list[ManageLead]:
        self.ensure_seed_data()
        rows = manage_lead_repository.list_leads(filters)
        return [self._to_manage_lead(row) for row in rows]

    def list_bin(self) -> list[BinLead]:
        return manage_lead_repository.list_bin()

    def get_lead(self, lead_id: str) -> ManageLead | None:
        self.ensure_seed_data()
        row = manage_lead_repository.get_lead(lead_id)
        if row is None:
            return None
        return self._to_manage_lead(row)

    def create_lead(self, payload: CreateLeadRequest) -> ManageLead:
        now = utc_now()
        lead = LeadModel(
            id=str(uuid4()),
            source=payload.source,
            name=payload.name,
            company=payload.company,
            stage=payload.stage,
            email=payload.email,
            phone=payload.phone,
            budget_estimate=payload.budget_estimate,
            urgency=payload.urgency,
            content=f"Manual lead: {payload.name}",
            summary=f"Manual lead for {payload.company}",
            score=payload.score,
            tags="manual",
            intent_label="high" if payload.score >= 80 else "medium",
            last_activity_at=now,
            notes=payload.notes,
            is_going_cold=False,
            is_deleted=False,
            deleted_at=None,
            created_at=now,
            updated_at=now,
        )
        created = manage_lead_repository.create_lead(lead)
        manage_lead_repository.add_activity(created.id, "LEAD_CREATED", "Lead created manually.", now)
        return self._to_manage_lead(created)

    def get_insights(self) -> ManageLeadInsights:
        leads = self.list_leads(LeadListFilters())
        return ManageLeadInsights(
            hot_leads_need_reply=len(
                [lead for lead in leads if lead.score >= 85 and lead.stage in {"QUALIFIED", "CONTACTED", "RESPONDED"}]
            ),
            leads_going_cold=len([lead for lead in leads if lead.is_going_cold]),
            leads_likely_to_close=len(
                [lead for lead in leads if lead.ai_analysis.deal_probability >= 70 and lead.stage in {"RESPONDED", "CONTRACTED"}]
            ),
        )

    def update_lead(self, lead_id: str, payload: LeadUpdateRequest) -> ManageLead | None:
        row = manage_lead_repository.get_lead(lead_id)
        if row is None:
            return None

        previous_stage = row.stage
        if payload.name is not None:
            row.name = payload.name
        if payload.company is not None:
            row.company = payload.company
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

        self._sync_to_crm_if_contracted(updated, payload.notes)
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
        updated = manage_lead_repository.upsert_lead(lead)

        message = payload.note or payload.action_type.replace("_", " ").title()
        manage_lead_repository.add_activity(lead_id, payload.action_type, message, now)

        self._sync_to_crm_if_contracted(updated, payload.note)
        return self.get_lead(lead_id)

    def bulk_action(self, payload: BulkLeadActionRequest) -> int:
        now = utc_now()
        updated_count = 0
        for lead_id in payload.lead_ids:
            lead = manage_lead_repository.get_lead(lead_id)
            if lead is None:
                continue

            if payload.action == "SOFT_DELETE":
                if manage_lead_repository.soft_delete(lead_id, now):
                    manage_lead_repository.add_activity(lead_id, "SOFT_DELETED", "Lead moved to bin.", now)
                    updated_count += 1
                continue

            if payload.action == "MARK_CONTACTED":
                lead.stage = "CONTACTED"
            elif payload.action == "MARK_RESPONDED":
                lead.stage = "RESPONDED"
            elif payload.action == "MOVE_STAGE" and payload.target_stage:
                lead.stage = payload.target_stage
            else:
                continue

            lead.updated_at = now
            lead.last_activity_at = now
            saved = manage_lead_repository.upsert_lead(lead)
            manage_lead_repository.add_activity(
                lead_id,
                "BULK_ACTION",
                f"Bulk action applied: {payload.action}",
                now,
            )
            self._sync_to_crm_if_contracted(saved)
            updated_count += 1

        return updated_count

    def soft_delete_lead(self, lead_id: str) -> bool:
        now = utc_now()
        deleted = manage_lead_repository.soft_delete(lead_id, now)
        if deleted:
            manage_lead_repository.add_activity(lead_id, "SOFT_DELETED", "Lead moved to bin.", now)
        return deleted

    def restore_lead(self, lead_id: str) -> bool:
        now = utc_now()
        restored = manage_lead_repository.restore(lead_id, now)
        if restored:
            manage_lead_repository.add_activity(lead_id, "RESTORED", "Lead restored from bin.", now)
        return restored

    def delete_lead_forever(self, lead_id: str) -> bool:
        return manage_lead_repository.delete_forever(lead_id)

    def import_csv_rows(self, payload: CSVImportRequest) -> CSVImportResult:
        accepted = 0
        skipped = 0
        invalid = 0
        warnings: list[str] = []
        errors: list[str] = []

        for row_index, raw_row in enumerate(payload.rows, start=1):
            normalized: dict[str, str] = {}
            for key, value in raw_row.items():
                normalized_key = self._normalize_header(key)
                mapped_key = payload.field_mapping.get(key) or payload.field_mapping.get(normalized_key) or HEADER_ALIASES.get(normalized_key)
                if mapped_key:
                    normalized[mapped_key] = value

            name = normalized.get("name") or ""
            company = normalized.get("company") or ""
            if not name.strip() and not company.strip():
                invalid += 1
                errors.append(f"Row {row_index}: missing name/company")
                continue

            email = (normalized.get("email") or "").strip() or None
            if email and manage_lead_repository.get_by_email(email) is not None:
                warnings.append(f"Row {row_index}: duplicate email kept as new lead ({email})")

            now = utc_now()
            lead = LeadModel(
                id=str(uuid4()),
                source=self._normalize_source(normalized.get("source")),
                name=name.strip() or company.strip(),
                company=company.strip() or "Unknown Company",
                stage=self._normalize_stage(normalized.get("stage")),
                email=email,
                phone=(normalized.get("phone") or "").strip() or None,
                budget_estimate=self._parse_budget(normalized.get("budget_estimate")),
                urgency=self._normalize_urgency(normalized.get("urgency")),
                content=f"Imported lead {name or company}",
                summary=f"Imported from CSV row {row_index}",
                score=self._parse_score(normalized.get("score")),
                tags="import,csv",
                intent_label="medium",
                last_activity_at=self._parse_dt(normalized.get("last_activity_at")),
                notes="Imported from CSV",
                is_going_cold=False,
                is_deleted=False,
                deleted_at=None,
                created_at=now,
                updated_at=now,
            )
            try:
                created = manage_lead_repository.create_lead(lead)
                manage_lead_repository.add_activity(
                    created.id,
                    "CSV_IMPORTED",
                    "Lead imported from CSV.",
                    now,
                )
                accepted += 1
            except Exception as exc:  # noqa: BLE001
                skipped += 1
                errors.append(f"Row {row_index}: {exc}")

        return CSVImportResult(
            accepted=accepted,
            skipped=skipped,
            invalid=invalid,
            warnings=warnings,
            errors=errors,
        )

    def import_csv_text(self, csv_text: str, field_mapping: dict[str, str] | None = None) -> CSVImportResult:
        reader = csv.DictReader(StringIO(csv_text))
        rows = [dict(row) for row in reader if row]
        return self.import_csv_rows(
            CSVImportRequest(rows=rows, field_mapping=field_mapping or {}),
        )

    def get_timeline(self, lead_id: str) -> list[ManageLeadActivity]:
        return manage_lead_repository.list_activities(lead_id)

    def get_analytics(self) -> ManageLeadAnalytics:
        leads = self.list_leads(LeadListFilters())
        total = len(leads)
        contracted = len([lead for lead in leads if lead.stage == "CONTRACTED"])
        open_pipeline = [lead for lead in leads if lead.stage != "CONTRACTED"]
        pipeline_value = sum(lead.budget_estimate for lead in open_pipeline)
        stage_drop_offs: dict[str, int] = {}
        for stage in ["NEW", "QUALIFIED", "CONTACTED", "RESPONDED", "CONTRACTED"]:
            stage_drop_offs[stage] = len([lead for lead in leads if lead.stage == stage])

        conversion = round((contracted / total) * 100, 2) if total else 0.0
        return ManageLeadAnalytics(
            total_leads=total,
            contracted_count=contracted,
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
            last_activity_at = lead.last_activity_at
            if now.tzinfo is not None and last_activity_at.tzinfo is None:
                last_activity_at = last_activity_at.replace(tzinfo=now.tzinfo)
            elif now.tzinfo is None and last_activity_at.tzinfo is not None:
                last_activity_at = last_activity_at.replace(tzinfo=None)

            idle_days = (now - last_activity_at).days
            if idle_days >= 2 and lead.stage in {"QUALIFIED", "CONTACTED", "RESPONDED"}:
                reminders_due += 1
                manage_lead_repository.add_activity(
                    lead.id,
                    "FOLLOW_UP_REMINDER",
                    "No reply in 2+ days, reminder queued.",
                    now,
                )
            if idle_days >= 5 and lead.stage in {"QUALIFIED", "CONTACTED", "RESPONDED"}:
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
