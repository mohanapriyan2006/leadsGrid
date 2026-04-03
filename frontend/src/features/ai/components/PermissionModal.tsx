import type { AgentStep } from "../types/agent";
import { AGENT_ACTIONS } from "../constants/agentActions";

type PermissionModalProps = {
  step: AgentStep;
  onApprove: () => void;
  onSkip: () => void;
  onAbort: () => void;
  autoApproveLowRisk: boolean;
  onToggleAutoApprove: () => void;
};

const RISK_BADGE: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-success/10 text-success/80" },
  medium: { label: "Med", className: "bg-warning/10 text-warning/80" },
  high: { label: "High", className: "bg-danger/10 text-danger/80" },
};

export const PermissionModal = ({
  step,
  onApprove,
  onSkip,
  onAbort,
  autoApproveLowRisk,
  onToggleAutoApprove,
}: PermissionModalProps) => {
  const action = AGENT_ACTIONS[step.actionType];
  const risk = RISK_BADGE[step.riskLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-md">
      <div
        className="mx-4 w-full max-w-md rounded-2xl border border-accent/[0.1] bg-surface-secondary p-5 shadow-[0_16px_64px_rgba(0,0,0,0.5)] animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-label="Permission required"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/[0.08] text-base">
            🔐
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-content">Permission Required</h3>
            <p className="text-[11px] text-content-tertiary">Approve this action before execution</p>
          </div>
        </div>

        <div className="rounded-xl border border-accent/[0.06] bg-surface/40 p-3.5 mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[12px]">{action.icon}</span>
            <span className="text-[13px] font-medium text-content">{step.label}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${risk.className}`}>
              {risk.label}
            </span>
          </div>
          <p className="text-[12px] text-content-tertiary leading-relaxed">{step.description}</p>
        </div>

        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={autoApproveLowRisk}
            onChange={onToggleAutoApprove}
            className="h-3.5 w-3.5 rounded border-accent/20 bg-surface accent-accent"
          />
          <span className="text-[12px] text-content-tertiary">
            Auto-approve low-risk actions
          </span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 rounded-xl bg-gradient-to-r from-info to-info/80 px-4 py-2.5 text-[13px] font-semibold text-surface shadow-[0_2px_12px_rgba(6,182,212,0.2)] transition-all hover:shadow-[0_2px_20px_rgba(6,182,212,0.3)]"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-xl border border-accent/[0.08] bg-surface/40 px-4 py-2.5 text-[13px] font-medium text-content-secondary transition-all hover:border-accent/15 hover:text-content"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onAbort}
            className="rounded-xl border border-danger/[0.1] bg-danger/[0.05] px-4 py-2.5 text-[13px] font-medium text-danger/70 transition hover:bg-danger/[0.1] hover:text-danger"
          >
            Abort
          </button>
        </div>
      </div>
    </div>
  );
};
