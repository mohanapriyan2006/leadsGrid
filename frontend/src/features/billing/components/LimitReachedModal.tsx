import { useNavigate } from "react-router-dom";
import { X, AlertTriangle } from "lucide-react";
import type { LimitReachedDetail } from "../hooks/useLimitModal";

const actionLabels: Record<string, string> = {
  storage_limit: "Lead Storage",
  leads_discovery_per_day: "Lead Discovery",
  email_sending_per_day: "Email Sending",
  crm_ai_analysis_per_day: "CRM AI Analysis",
  ask_ai_per_month: "Ask AI Credits",
  agent_ai_per_month: "Agent AI Credits",
  other_ai_per_day: "Other AI Features",
};

type LimitReachedModalProps = {
  open: boolean;
  data: LimitReachedDetail | null;
  onClose: () => void;
};

export const LimitReachedModal = ({ open, data, onClose }: LimitReachedModalProps) => {
  const navigate = useNavigate();

  if (!open || !data) return null;

  const label = actionLabels[data.action] ?? data.action;
  const percent = Math.min(100, Math.round((data.current / data.limit) * 100));

  const handleUpgrade = () => {
    onClose();
    navigate("/settings?tab=billing");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-accent/20 bg-surface-secondary/95 p-6 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-content-secondary transition hover:text-content"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/15">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-content">Plan Limit Reached</h3>
            <p className="text-xs text-content-secondary">
              You have exceeded your usage limit.
            </p>
          </div>
        </div>

        <div className="mb-4 space-y-3 rounded-glass-sm border border-accent/10 bg-surface/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-content-secondary">Feature</span>
            <span className="text-sm font-semibold text-content">{label}</span>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-content-secondary">Usage</span>
              <span className="text-xs font-semibold text-content">
                {data.current.toLocaleString()} / {data.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-danger transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUpgrade}
          className="accent-btn w-full py-2.5 text-xs font-bold uppercase tracking-[0.1em]"
        >
          Upgrade Plan
        </button>

        <p className="mt-3 text-center text-[11px] text-content-secondary">
          Unlock higher limits by upgrading your plan in the Billing section.
        </p>
      </div>
    </div>
  );
};
