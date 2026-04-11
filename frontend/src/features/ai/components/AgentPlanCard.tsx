import type { AgentPlan, AgentStep } from "../types/agent";
import { AGENT_ACTIONS } from "../constants/agentActions";

type AgentPlanCardProps = {
  plan: AgentPlan;
  onApproveAll: () => void;
  onApproveStepByStep: () => void;
  onEditStep: (stepId: string, updates: Partial<{ label: string; description: string }>) => void;
  onRemoveStep: (stepId: string) => void;
};

const RISK_BADGE: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-success/10 text-success/80" },
  medium: { label: "Med", className: "bg-warning/10 text-warning/80" },
  high: { label: "High", className: "bg-danger/10 text-danger/80" },
};

const StepRow = ({
  step,
  index,
  onRemove,
}: {
  step: AgentStep;
  index: number;
  onRemove: () => void;
}) => {
  const action = AGENT_ACTIONS[step.actionType];
  const risk = RISK_BADGE[step.riskLevel];

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 transition-all ${
        step.status === "completed"
          ? "border-success/[0.1] bg-success/[0.04]"
          : step.status === "running"
            ? "border-info/[0.15] bg-info/[0.05]"
            : step.status === "failed"
              ? "border-danger/[0.1] bg-danger/[0.04]"
              : "border-accent/[0.06] bg-surface/30"
      }`}
    >
      <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
        step.status === "completed"
          ? "bg-success/15 text-success"
          : step.status === "running"
            ? "bg-info/15 text-info animate-pulse"
            : step.status === "failed"
              ? "bg-danger/15 text-danger"
              : "bg-accent/[0.06] text-content-tertiary"
      }`}>
        {step.status === "completed" ? "✓" : step.status === "running" ? "●" : step.status === "failed" ? "✕" : index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px]">{action.icon}</span>
          <span className="text-[13px] font-medium text-content">{step.label}</span>
          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${risk.className}`}>
            {risk.label}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-content-tertiary leading-relaxed">{step.description}</p>
        {step.result ? (
          <p className="mt-1 text-[11px] text-success/80">{step.result}</p>
        ) : null}
        {step.evaluation ? (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-content-tertiary">
            <span className="rounded-md border border-accent/[0.08] bg-surface/60 px-1.5 py-0.5">
              Eval {step.evaluation.score}/100
            </span>
            {step.evaluation.issues.slice(0, 2).map((issue) => (
              <span key={issue} className="rounded-md border border-warning/[0.12] bg-warning/[0.05] px-1.5 py-0.5 text-warning/80">
                {issue}
              </span>
            ))}
          </div>
        ) : null}
        {step.error ? (
          <p className="mt-1 text-[11px] text-danger/80">{step.error}</p>
        ) : null}
      </div>

      {step.status === "pending" ? (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 rounded-md border border-danger/[0.1] px-1.5 py-0.5 text-[10px] text-danger/50 transition hover:bg-danger/[0.08] hover:text-danger"
          title="Remove step"
          aria-label={`Remove step: ${step.label}`}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
};

export const AgentPlanCard = ({
  plan,
  onApproveAll,
  onApproveStepByStep,
  onEditStep,
  onRemoveStep,
}: AgentPlanCardProps) => {
  return (
    <div className="rounded-2xl border border-info/[0.1] bg-surface-secondary/40 p-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/[0.08] text-sm">
          ⚡
        </div>
        <div className="flex-1">
          <h4 className="text-[13px] font-semibold text-content">Execution Plan</h4>
          <p className="text-[11px] text-content-tertiary">
            {plan.steps.length} steps — "{plan.title}"
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {plan.steps.map((step, index) => (
          <StepRow
            key={step.id}
            step={step}
            index={index}
            onRemove={() => onRemoveStep(step.id)}
          />
        ))}
      </div>

      {!plan.approved ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onApproveAll}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-info to-info/80 px-4 py-2 text-[12px] font-semibold text-surface shadow-[0_2px_12px_rgba(6,182,212,0.2)] transition-all hover:shadow-[0_2px_20px_rgba(6,182,212,0.3)]"
          >
            ✓ Approve All
          </button>
          <button
            type="button"
            onClick={onApproveStepByStep}
            className="rounded-xl border border-accent/[0.08] bg-surface/40 px-4 py-2 text-[12px] font-medium text-content-secondary transition-all hover:border-accent/15 hover:text-content"
          >
            Step-by-Step
          </button>
        </div>
      ) : null}
    </div>
  );
};
