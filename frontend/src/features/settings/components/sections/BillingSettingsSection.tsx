import type { AppSettings } from "../../types/settings";
import { SettingsSectionCard } from "../SettingsSectionCard";
import { PricingPlansDisplay } from "../../../landing/components/sections/PricingSection";
import {
  PRICING_PLANS,
} from "../../../common/constants/pricingPlans";

type BillingSettingsSectionProps = {
  billing: AppSettings["billing"];
  onChange: (billing: AppSettings["billing"]) => void;
};

export const BillingSettingsSection = ({ billing, onChange }: BillingSettingsSectionProps) => {
  const currentPlan = PRICING_PLANS[billing.currentPlan];

  return (
    <SettingsSectionCard
      title="Billing"
      description="Track plan, credits, and usage snapshots."
      badge="Core Scaffold"
    >
      <div className="rounded-glass-sm border border-accent/10 bg-surface/30 px-3 py-2">
        <p className="text-[11px] uppercase tracking-[0.12em] text-content-secondary">Current Plan</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-content">{currentPlan.name}</span>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
            {currentPlan.family === "single" ? "Single User" : "Organisation"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-content-secondary">{currentPlan.tagline}</p>
      </div>

      <PricingPlansDisplay
        compact
        activePlanKey={billing.currentPlan}
        onPlanSelect={(planKey) => onChange({ ...billing, currentPlan: planKey })}
      />

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

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="accent-btn flex-1 py-2.5 text-xs font-semibold tracking-[0.08em]">
          UPGRADE PLAN
        </button>
        <button type="button" className="glass-btn flex-1 py-2.5 text-xs font-semibold tracking-[0.08em] text-content-secondary hover:text-content">
          MANAGE PAYMENT
        </button>
      </div>

      <div className="flex items-center justify-between rounded-glass-sm border border-accent/10 bg-surface/20 px-3 py-2">
        <p className="text-xs text-content-secondary">Need to change your plan or cancel?</p>
        <button type="button" className="text-xs font-semibold text-accent hover:underline">
          View Invoices
        </button>
      </div>
    </SettingsSectionCard>
  );
};
