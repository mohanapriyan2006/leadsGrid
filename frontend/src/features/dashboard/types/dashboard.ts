import type { ManageLead, ManageLeadAnalytics, ManageLeadInsights, ManageLeadStage } from "../../leads/types/manageLead";

export type DashboardKpi = {
  id: "total" | "hot" | "pipeline" | "conversion" | "cold";
  title: string;
  value: string;
  delta: string;
};

export type DashboardStageMetric = {
  stage: ManageLeadStage;
  label: string;
  count: number;
};

export type DashboardRecentActivity = {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
};

export type DashboardQuickAction = {
  id: string;
  label: string;
  description: string;
  path: string;
};

export type DashboardViewModel = {
  leads: ManageLead[];
  hotLeads: ManageLead[];
  kpis: DashboardKpi[];
  stageMetrics: DashboardStageMetric[];
  recentActivity: DashboardRecentActivity[];
  quickActions: DashboardQuickAction[];
  insights: ManageLeadInsights | null;
  analytics: ManageLeadAnalytics | null;
  loading: boolean;
  error: string | null;
  lastUpdatedIso: string;
};
