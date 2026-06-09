export const UNLIMITED_SOFT_CAP = 999_999;
export const FAIR_USAGE_THRESHOLD = 0.8;

export type UsageAction =
  | "storage_limit"
  | "leads_discovery_per_day"
  | "email_sending_per_day"
  | "crm_analysis_per_day"
  | "leads_analysis_per_day"
  | "ask_ai_per_month"
  | "agent_ai_per_month"
  | "other_ai_per_day";

export const DAILY_ACTIONS: UsageAction[] = [
  "leads_discovery_per_day",
  "email_sending_per_day",
  "crm_analysis_per_day",
  "leads_analysis_per_day",
  "other_ai_per_day",
];

export const MONTHLY_ACTIONS: UsageAction[] = [
  "ask_ai_per_month",
  "agent_ai_per_month",
];

export type LimitCheckResult = {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  action: UsageAction;
};
