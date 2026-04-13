export type PlanFamily = "single" | "organisation";

export type PricingPlanKey =
  | "single_free"
  | "single_pro"
  | "single_max"
  | "org_normal"
  | "org_pro"
  | "org_max";

export type PlanLimitValue = number | "unlimited";

export type PlanLimits = {
  storage_limit: PlanLimitValue;
  leads_discovery_per_day: PlanLimitValue;
  email_sending_per_day: PlanLimitValue;
  crm_ai_analysis_per_day: PlanLimitValue;
  ask_ai_per_month: PlanLimitValue;
  agent_ai_per_month: PlanLimitValue;
  other_ai_per_day: PlanLimitValue;
};

export type PricingPlanDefinition = {
  key: PricingPlanKey;
  family: PlanFamily;
  name: string;
  monthlyPriceInr: number | null;
  yearlyPriceInr: number | null;
  tagline: string;
  ctaLabel: string;
  highlighted?: boolean;
  fairUsage?: boolean;
  compactHighlights: string[];
  fullHighlights: string[];
  limits: PlanLimits;
};

export const PLAN_ORDER: Record<PlanFamily, PricingPlanKey[]> = {
  single: ["single_free", "single_pro", "single_max"],
  organisation: ["org_normal", "org_pro", "org_max"],
};

export const PRICING_PLANS: Record<PricingPlanKey, PricingPlanDefinition> = {
  single_free: {
    key: "single_free",
    family: "single",
    name: "Free",
    monthlyPriceInr: 0,
    yearlyPriceInr: 0,
    tagline: "Best for beginners and testing",
    ctaLabel: "Start Free",
    compactHighlights: [
      "Storage: 100 leads",
      "Leads Discovery: 2/day",
      "Email Sending: 5/day",
      "Ask AI: 100/month",
      "Agent AI: 30/month",
    ],
    fullHighlights: [
      "Full Manage Leads + CRM access (without advanced AI analysis)",
      "Manage Leads + CRM AI Analysis: 2/day each",
      "Other AI features: 10/day",
      "Limited integrations",
      "Community support",
    ],
    limits: {
      storage_limit: 100,
      leads_discovery_per_day: 2,
      email_sending_per_day: 5,
      crm_ai_analysis_per_day: 2,
      ask_ai_per_month: 100,
      agent_ai_per_month: 30,
      other_ai_per_day: 10,
    },
  },
  single_pro: {
    key: "single_pro",
    family: "single",
    name: "Pro",
    monthlyPriceInr: 999,
    yearlyPriceInr: 9999,
    tagline: "Best for freelancers and consistent users",
    ctaLabel: "Upgrade to Pro",
    highlighted: true,
    compactHighlights: [
      "Storage: 5,000 leads",
      "Leads Discovery: 75/day",
      "Email Sending: 300/day",
      "Ask AI: 2,500/month",
      "Agent AI: 800/month",
    ],
    fullHighlights: [
      "Manage Leads + CRM AI Analysis: 150/day each",
      "Other AI features: 100/day",
      "Smart AI lead scoring",
      "Email personalization + templates",
      "Automated follow-ups (basic)",
      "CSV import/export",
      "Standard integrations (Gmail, SMTP)",
      "Priority email support",
      "Extra credits: INR 199 for 500 credits",
    ],
    limits: {
      storage_limit: 5000,
      leads_discovery_per_day: 75,
      email_sending_per_day: 300,
      crm_ai_analysis_per_day: 150,
      ask_ai_per_month: 2500,
      agent_ai_per_month: 800,
      other_ai_per_day: 100,
    },
  },
  single_max: {
    key: "single_max",
    family: "single",
    name: "Max",
    monthlyPriceInr: 2499,
    yearlyPriceInr: 24999,
    tagline: "Best for power users and advanced automation",
    ctaLabel: "Go Max",
    compactHighlights: [
      "Storage: Unlimited (fair usage)",
      "Leads Discovery: 250/day",
      "Email Sending: 1,500/day",
      "Ask AI: 10,000/month",
      "Agent AI: 3,000/month",
    ],
    fullHighlights: [
      "Manage Leads + CRM AI Analysis: Unlimited (fair usage)",
      "Other AI features: 500/day",
      "Advanced AI automation workflows",
      "Advanced analytics dashboard",
      "Deliverability tools + warmup",
      "Custom AI templates + optimization",
      "All integrations + webhooks",
      "Priority support",
      "Extra credits: INR 499 for 2,000 credits",
    ],
    fairUsage: true,
    limits: {
      storage_limit: "unlimited",
      leads_discovery_per_day: 250,
      email_sending_per_day: 1500,
      crm_ai_analysis_per_day: "unlimited",
      ask_ai_per_month: 10000,
      agent_ai_per_month: 3000,
      other_ai_per_day: 500,
    },
  },
  org_normal: {
    key: "org_normal",
    family: "organisation",
    name: "Normal",
    monthlyPriceInr: 4999,
    yearlyPriceInr: 49999,
    tagline: "For small teams (2-10 members)",
    ctaLabel: "Start Team Plan",
    compactHighlights: [
      "Users: up to 10",
      "Storage: 50,000 shared leads",
      "Leads Discovery: 800/day",
      "Email Sending: 3,000/day",
      "Ask AI: 20,000/month",
    ],
    fullHighlights: [
      "Shared CRM workspace (AI enabled)",
      "Manage Leads + CRM AI Analysis: 1,500/day",
      "Agent AI: 7,000/month",
      "Other AI features: 1,000/day",
      "Team pipelines (Kanban + table)",
      "Basic role-based access",
      "Activity tracking",
      "Shared templates",
    ],
    limits: {
      storage_limit: 50000,
      leads_discovery_per_day: 800,
      email_sending_per_day: 3000,
      crm_ai_analysis_per_day: 1500,
      ask_ai_per_month: 20000,
      agent_ai_per_month: 7000,
      other_ai_per_day: 1000,
    },
  },
  org_pro: {
    key: "org_pro",
    family: "organisation",
    name: "Pro",
    monthlyPriceInr: 9999,
    yearlyPriceInr: 99999,
    tagline: "For growing teams (10-20 members)",
    ctaLabel: "Scale Team",
    highlighted: true,
    compactHighlights: [
      "Users: up to 20",
      "Storage: Unlimited (fair usage)",
      "Leads Discovery: 3,000/day",
      "Email Sending: 12,000/day",
      "Ask AI: 100,000/month",
    ],
    fullHighlights: [
      "Manage Leads + CRM AI Analysis: 6,000/day",
      "Agent AI: 35,000/month",
      "Other AI features: 5,000/day",
      "Advanced team collaboration",
      "Multi-step workflow automation",
      "AI team insights + performance tracking",
      "API access (limited)",
      "Integrations (Zapier, Webhooks, CRM tools)",
      "Priority support",
    ],
    limits: {
      storage_limit: "unlimited",
      leads_discovery_per_day: 3000,
      email_sending_per_day: 12000,
      crm_ai_analysis_per_day: 6000,
      ask_ai_per_month: 100000,
      agent_ai_per_month: 35000,
      other_ai_per_day: 5000,
    },
  },
  org_max: {
    key: "org_max",
    family: "organisation",
    name: "Max",
    monthlyPriceInr: null,
    yearlyPriceInr: null,
    tagline: "For agencies and scale businesses",
    ctaLabel: "Contact Sales",
    fairUsage: true,
    compactHighlights: [
      "Users: Unlimited",
      "Storage: Unlimited (fair usage)",
      "Leads Discovery: Unlimited",
      "Email Sending: Unlimited",
      "Ask AI: 400,000/month",
    ],
    fullHighlights: [
      "Manage Leads + CRM AI Analysis: Unlimited",
      "Agent AI: 150,000/month",
      "Other AI features: 20,000/day",
      "Dedicated AI SDR workflows",
      "Advanced analytics + forecasting",
      "Custom integrations + full API access",
      "White-label option",
      "SLA support + dedicated manager",
    ],
    limits: {
      storage_limit: "unlimited",
      leads_discovery_per_day: "unlimited",
      email_sending_per_day: "unlimited",
      crm_ai_analysis_per_day: "unlimited",
      ask_ai_per_month: 400000,
      agent_ai_per_month: 150000,
      other_ai_per_day: 20000,
    },
  },
};

export const getFamilyPlans = (family: PlanFamily): PricingPlanDefinition[] =>
  PLAN_ORDER[family].map((planKey) => PRICING_PLANS[planKey]);

export const formatInr = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const monthlyEquivalentFromYearly = (yearlyPriceInr: number): number =>
  Math.round(yearlyPriceInr / 12);
