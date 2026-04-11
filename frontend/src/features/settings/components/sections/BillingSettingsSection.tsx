import type { AppSettings } from "../../types/settings";
import { SettingsSectionCard } from "../SettingsSectionCard";

type BillingSettingsSectionProps = {
  billing: AppSettings["billing"];
  onChange: (billing: AppSettings["billing"]) => void;
};

export const BillingSettingsSection = ({ billing, onChange }: BillingSettingsSectionProps) => {
  return (
    <SettingsSectionCard
      title="Billing"
      description="Track plan, credits, and usage snapshots."
      badge="Core Scaffold"
    >
      <div className="grid gap-3 md:grid-cols-3">
        {(["free", "pro", "agency"] as const).map((plan) => (
          <button
            key={plan}
            type="button"
            onClick={() => onChange({ ...billing, currentPlan: plan })}
            className={`rounded-glass-sm border px-3 py-3 text-left transition-all duration-200 ${
              billing.currentPlan === plan
                ? "border-accent/50 bg-accent-soft text-content shadow-glow"
                : "border-accent/10 bg-surface-secondary/70 text-content-secondary hover:border-accent/30"
            }`}
          >
            <p className="text-sm font-semibold uppercase">{plan}</p>
            <p className="text-xs text-content-secondary">{plan === "free" ? "Starter" : plan === "pro" ? "Growth" : "Team"}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="glass-card-sm px-3 py-2">
          <p className="text-xs text-content-secondary">Credits Remaining</p>
          <p className="text-lg font-semibold text-content">{billing.creditsRemaining}</p>
        </div>
        <div className="glass-card-sm px-3 py-2">
          <p className="text-xs text-content-secondary">Leads Scanned</p>
          <p className="text-lg font-semibold text-content">{billing.usage.leadsScanned}</p>
        </div>
        <div className="glass-card-sm px-3 py-2">
          <p className="text-xs text-content-secondary">AI Messages</p>
          <p className="text-lg font-semibold text-content">{billing.usage.aiMessagesGenerated}</p>
        </div>
      </div>

      <button type="button" className="accent-btn w-full py-2.5 text-xs font-semibold tracking-[0.08em]">
        UPGRADE PLAN
      </button>
    </SettingsSectionCard>
  );
};
