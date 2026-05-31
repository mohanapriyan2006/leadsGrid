import type { AppSettings } from "../../types/settings";
import { SettingsSectionCard } from "../SettingsSectionCard";
import {
  PLAN_ORDER,
  PRICING_PLANS,
  type PlanFamily,
} from "../../../common/constants/pricingPlans";

type BillingSettingsSectionProps = {
  billing: AppSettings["billing"];
  onChange: (billing: AppSettings["billing"]) => void;
};

export const BillingSettingsSection = ({ billing, onChange }: BillingSettingsSectionProps) => {
  const families: PlanFamily[] = ["single", "organisation"];

  return (
    <SettingsSectionCard
      title="Billing"
      description="Track plan, credits, and usage snapshots."
      badge="Core Scaffold"
    >
      <div className="space-y-3">
        {families.map((family) => (
          <div key={family} className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.12em]  text-content-tertiaryy">
              {family === "single" ? "Single User" : "Organisation"}
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              {PLAN_ORDER[family].map((planKey) => {
                const plan = PRICING_PLANS[planKey];
                const active = billing.currentPlan === planKey;

                return (
                  <button
                    key={planKey}
                    type="button"
                    onClick={() => onChange({ ...billing, currentPlan: planKey })}
                    className={`rounded-glass-sm border px-3 py-3 text-left transition-all duration-200 ${
                      active
                        ? "border-accent/50 bg-accent-soft text-content shadow-glow"
                        : "border-accent/10 bg-surface-secondary/70 text-content-secondary hover:border-accent/30"
                    }`}
                  >
                    <p className="text-sm font-semibold uppercase">{plan.name}</p>
                    <p className="mt-0.5 text-xs text-content-secondary">{plan.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>
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
