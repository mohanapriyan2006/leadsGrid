from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status

from app.schemas.agent import (
    AgentActionResult,
    AgentPlan,
    AgentRunState,
    ApprovalMode,
    LeadItem,
)
from app.services.agent_executor import AgentExecutor


TERMINAL_STEP_STATUSES = {"completed", "failed", "skipped"}
TERMINAL_RUN_STATUSES = {"completed", "failed", "aborted"}


@dataclass
class _RunRecord:
    run_id: str
    user_id: str
    prompt: str
    tone: str
    auto_save: bool
    auto_approve_low_risk: bool
    approval_mode: ApprovalMode
    plan: AgentPlan
    leads: list[dict[str, Any]]
    status: str = "running"
    current_step_index: int = 0
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime | None = None
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    results: list[AgentActionResult] = field(default_factory=list)
    logged: bool = False


class AgentRunService:
    def __init__(self, executor: AgentExecutor):
        self._executor = executor
        self._runs: dict[str, _RunRecord] = {}

    async def start_run(
        self,
        prompt: str,
        leads: list[LeadItem],
        tone: str,
        user_id: str,
        auto_save: bool,
        approval_mode: ApprovalMode,
        auto_approve_low_risk: bool,
    ) -> AgentRunState:
        plan = await self._executor.build_plan(prompt, leads)
        plan.approved = True
        plan.approvalMode = approval_mode

        run_id = str(uuid4())
        record = _RunRecord(
            run_id=run_id,
            user_id=user_id,
            prompt=prompt,
            tone=tone,
            auto_save=auto_save,
            auto_approve_low_risk=auto_approve_low_risk,
            approval_mode=approval_mode,
            plan=plan,
            leads=[lead.model_dump() for lead in leads],
        )
        self._runs[run_id] = record

        await self._advance(record, force_current_step=False)
        return self._to_run_state(record)

    def get_run(self, run_id: str, user_id: str) -> AgentRunState:
        record = self._get_record(run_id, user_id)
        return self._to_run_state(record)

    async def approve_next_step(
        self,
        run_id: str,
        user_id: str,
        auto_approve_low_risk: bool | None = None,
    ) -> AgentRunState:
        record = self._get_record(run_id, user_id)
        if auto_approve_low_risk is not None:
            record.auto_approve_low_risk = auto_approve_low_risk

        if record.status in TERMINAL_RUN_STATUSES:
            return self._to_run_state(record)

        await self._advance(record, force_current_step=True)
        return self._to_run_state(record)

    async def skip_next_step(
        self,
        run_id: str,
        user_id: str,
        auto_approve_low_risk: bool | None = None,
    ) -> AgentRunState:
        record = self._get_record(run_id, user_id)
        if auto_approve_low_risk is not None:
            record.auto_approve_low_risk = auto_approve_low_risk

        if record.status in TERMINAL_RUN_STATUSES:
            return self._to_run_state(record)

        next_index = self._next_pending_index(record.plan)
        if next_index >= len(record.plan.steps):
            self._mark_completed(record)
            return self._to_run_state(record)

        step = record.plan.steps[next_index]
        if step.status not in TERMINAL_STEP_STATUSES:
            step.status = "skipped"
            step.result = "Skipped by user approval"
            step.error = None

        record.current_step_index = next_index + 1
        record.updated_at = datetime.now(timezone.utc)

        await self._advance(record, force_current_step=False)
        return self._to_run_state(record)

    def abort_run(self, run_id: str, user_id: str) -> AgentRunState:
        record = self._get_record(run_id, user_id)
        if record.status in TERMINAL_RUN_STATUSES:
            return self._to_run_state(record)

        record.status = "aborted"
        now = datetime.now(timezone.utc)
        record.updated_at = now
        record.completed_at = now
        self._log_if_needed(record)
        return self._to_run_state(record)

    async def _advance(self, record: _RunRecord, force_current_step: bool) -> None:
        if record.status in TERMINAL_RUN_STATUSES:
            return

        record.status = "running"
        record.updated_at = datetime.now(timezone.utc)
        force_this_step = force_current_step

        while True:
            next_index = self._next_pending_index(record.plan)
            record.current_step_index = next_index

            if next_index >= len(record.plan.steps):
                self._mark_completed(record)
                return

            step = record.plan.steps[next_index]
            needs_approval = (
                record.approval_mode == "step_by_step"
                and not (record.auto_approve_low_risk and step.riskLevel == "low")
            )

            if needs_approval and not force_this_step:
                record.status = "paused"
                record.updated_at = datetime.now(timezone.utc)
                return

            force_this_step = False
            step.status = "running"
            step.result = None
            step.error = None
            record.updated_at = datetime.now(timezone.utc)

            try:
                current_leads = [LeadItem(**lead) for lead in record.leads if lead.get("title")]
                result = await self._executor.execute_step(
                    step=step,
                    prompt=record.prompt,
                    leads=current_leads,
                    tone=record.tone,
                    user_id=record.user_id,
                    auto_save=record.auto_save,
                )
            except Exception as exc:  # pragma: no cover - defensive backend guard
                result = AgentActionResult(success=False, message=str(exc), data={})

            record.results.append(result)

            if result.success:
                step.status = "completed"
                step.result = result.message
                step.error = None
                self._merge_runtime_leads(record, result)
                record.updated_at = datetime.now(timezone.utc)
                continue

            step.status = "failed"
            step.error = result.message
            self._mark_failed(record, failed_index=next_index)
            return

    def _merge_runtime_leads(self, record: _RunRecord, result: AgentActionResult) -> None:
        leads_from_step = result.data.get("leads")
        scored_from_step = result.data.get("scoredLeads")

        if isinstance(leads_from_step, list):
            record.leads = [lead for lead in leads_from_step if isinstance(lead, dict)]
            return

        if isinstance(scored_from_step, list):
            record.leads = [lead for lead in scored_from_step if isinstance(lead, dict)]

    def _mark_failed(self, record: _RunRecord, failed_index: int) -> None:
        for step in record.plan.steps[failed_index + 1 :]:
            if step.status not in TERMINAL_STEP_STATUSES:
                step.status = "skipped"

        record.status = "failed"
        now = datetime.now(timezone.utc)
        record.updated_at = now
        record.completed_at = now
        self._log_if_needed(record)

    def _mark_completed(self, record: _RunRecord) -> None:
        record.status = "completed"
        now = datetime.now(timezone.utc)
        record.updated_at = now
        record.completed_at = now
        self._log_if_needed(record)

    def _log_if_needed(self, record: _RunRecord) -> None:
        if record.logged:
            return

        self._executor.firebase_client.log_agent_run(
            user_id=record.user_id,
            task=record.prompt,
            status=record.status,
            steps=[step.model_dump(mode="json") for step in record.plan.steps],
        )
        record.logged = True

    def _get_record(self, run_id: str, user_id: str) -> _RunRecord:
        record = self._runs.get(run_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent run not found",
            )

        if record.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Agent run belongs to a different user",
            )

        return record

    def _to_run_state(self, record: _RunRecord) -> AgentRunState:
        completed_steps = sum(1 for step in record.plan.steps if step.status in TERMINAL_STEP_STATUSES)
        return AgentRunState(
            runId=record.run_id,
            status=record.status,
            plan=record.plan,
            currentStepIndex=record.current_step_index,
            completedSteps=completed_steps,
            totalSteps=len(record.plan.steps),
            startedAt=record.started_at,
            completedAt=record.completed_at,
            updatedAt=record.updated_at,
            results=record.results,
        )

    @staticmethod
    def _next_pending_index(plan: AgentPlan) -> int:
        for index, step in enumerate(plan.steps):
            if step.status not in TERMINAL_STEP_STATUSES:
                return index
        return len(plan.steps)
