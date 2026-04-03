import type { ManageLead, ManageLeadAnalytics, ManageLeadInsights } from "../../leads/types/manageLead";
import {
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_STAGE_LABELS,
  DASHBOARD_STAGE_ORDER,
} from "../constants/dashboard";
import type {
  DashboardKpi,
  DashboardRecentActivity,
  DashboardStageMetric,
  DashboardViewModel,
} from "../types/dashboard";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

const formatCompact = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);

const relativeTime = (iso: string) => {
  const value = new Date(iso).getTime();
  if (Number.isNaN(value)) {
    return "just now";
  }

  const deltaMinutes = Math.max(0, Math.floor((Date.now() - value) / 60000));
  if (deltaMinutes < 60) {
    return `${deltaMinutes || 1}m ago`;
  }

  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours}h ago`;
  }

  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d ago`;
};

export const computeHotLeads = (leads: ManageLead[]) =>
  leads
    .filter((lead) => !lead.is_deleted && lead.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

export const computeStageMetrics = (leads: ManageLead[]): DashboardStageMetric[] => {
  const counts = leads.reduce<Record<string, number>>((acc, lead) => {
    const current = acc[lead.stage] ?? 0;
    acc[lead.stage] = current + 1;
    return acc;
  }, {});

  return DASHBOARD_STAGE_ORDER.map((stage) => ({
    stage,
    label: DASHBOARD_STAGE_LABELS[stage],
    count: counts[stage] ?? 0,
  }));
};

export const computeRecentActivity = (leads: ManageLead[]): DashboardRecentActivity[] =>
  leads
    .slice()
    .sort(
      (a, b) =>
        new Date(b.last_activity_at || b.updated_at).getTime() -
        new Date(a.last_activity_at || a.updated_at).getTime(),
    )
    .slice(0, 6)
    .map((lead) => ({
      id: lead.id,
      title: `${lead.name} at ${lead.company}`,
      subtitle: lead.ai_analysis.next_action || "Review and send next follow up",
      timestamp: relativeTime(lead.last_activity_at || lead.updated_at),
    }));

export const computeKpis = (
  leads: ManageLead[],
  insights: ManageLeadInsights | null,
  analytics: ManageLeadAnalytics | null,
): DashboardKpi[] => {
  const totalLeads = leads.length;
  const hotLeads = insights?.hot_leads_need_reply ?? leads.filter((lead) => lead.score >= 80).length;
  const goingCold = insights?.leads_going_cold ?? leads.filter((lead) => lead.is_going_cold).length;
  const pipelineValue =
    analytics?.pipeline_value ?? leads.reduce((sum, lead) => sum + (lead.budget_estimate || 0), 0);
  const contractedCount = leads.filter((lead) => lead.stage === "CONTRACTED").length;
  const conversionRate =
    analytics?.conversion_rate ?? (totalLeads ? (contractedCount / totalLeads) * 100 : 0);

  return [
    {
      id: "total",
      title: "Total Leads",
      value: formatCompact(totalLeads),
      delta: `${totalLeads} active records`,
    },
    {
      id: "hot",
      title: "Hot Leads",
      value: String(hotLeads),
      delta: "Need high-priority reply",
    },
    {
      id: "pipeline",
      title: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      delta: "Open opportunity estimate",
    },
    {
      id: "conversion",
      title: "Conversion",
      value: `${conversionRate.toFixed(1)}%`,
      delta: `${contractedCount} contracted deals`,
    },
    {
      id: "cold",
      title: "Going Cold",
      value: String(goingCold),
      delta: "Re-engagement needed",
    },
  ];
};

export const buildDashboardViewModel = (params: {
  leads: ManageLead[];
  insights: ManageLeadInsights | null;
  analytics: ManageLeadAnalytics | null;
  loading: boolean;
  error: string | null;
}): DashboardViewModel => {
  const { leads, insights, analytics, loading, error } = params;

  return {
    leads,
    hotLeads: computeHotLeads(leads),
    kpis: computeKpis(leads, insights, analytics),
    stageMetrics: computeStageMetrics(leads),
    recentActivity: computeRecentActivity(leads),
    quickActions: DASHBOARD_QUICK_ACTIONS,
    insights,
    analytics,
    loading,
    error,
    lastUpdatedIso: new Date().toISOString(),
  };
};
