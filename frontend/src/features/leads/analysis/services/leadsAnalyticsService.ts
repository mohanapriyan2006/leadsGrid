import type { ManageLead } from "../../types/manageLead";
import type {
  LeadSourceBucket,
  LeadsAIInsights,
  LeadsAnalysisFilters,
  LeadsAnalytics,
  LeadVelocityPoint,
  SourcePerformance,
  StageConversionPoint,
} from "../types/leadsAnalytics";

const MAX_AGE_BY_RANGE = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
} as const;

const SOURCE_ORDER: LeadSourceBucket[] = ["reddit", "linkedin", "csv", "manual"];

const toDaysSince = (iso: string) => {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return 0;
  const delta = Date.now() - ts;
  return Math.max(0, Math.floor(delta / (1000 * 60 * 60 * 24)));
};

const inferSourceBucket = (lead: ManageLead): LeadSourceBucket => {
  if (lead.source === "reddit") return "reddit";
  if (lead.source === "linkedin") return "linkedin";
  if (lead.source === "search" || lead.source === "hackernews" || lead.source === "twitter") return "manual";

  if (
    lead.category
    || lead.rating !== null
    || lead.review_count !== null
    || lead.address
    || lead.google_maps_url
  ) {
    return "csv";
  }

  return "manual";
};

const stageOrder = ["NEW", "CONTACTED", "QUALIFIED", "RESPONDED", "NEGOTIATION"];

const filterLeads = (leads: ManageLead[], filters: LeadsAnalysisFilters) => {
  const maxAge = MAX_AGE_BY_RANGE[filters.range];

  return leads.filter((lead) => {
    const ageDays = toDaysSince(lead.updated_at || lead.created_at);
    const inRange = ageDays <= maxAge;
    const stageMatch = filters.stage === "all" || lead.stage === filters.stage;
    const sourceMatch = filters.source === "all" || inferSourceBucket(lead) === filters.source;
    return inRange && stageMatch && sourceMatch;
  });
};

const buildSourcePerformance = (leads: ManageLead[]): SourcePerformance[] => {
  return SOURCE_ORDER.map((source) => {
    const scoped = leads.filter((lead) => inferSourceBucket(lead) === source);
    const highIntent = scoped.filter((lead) => lead.score >= 70).length;
    const highIntentRate = scoped.length === 0 ? 0 : (highIntent / scoped.length) * 100;

    return {
      source,
      total: scoped.length,
      highIntent,
      highIntentRate: Number(highIntentRate.toFixed(1)),
    };
  });
};

const buildStageConversion = (leads: ManageLead[]): StageConversionPoint[] => {
  return stageOrder.map((stage, index) => {
    const count = leads.filter((lead) => lead.stage === stage).length;
    const prev = index === 0 ? count : leads.filter((lead) => lead.stage === stageOrder[index - 1]).length;
    const dropOffRate = prev === 0 ? 0 : Number((100 - (count / prev) * 100).toFixed(1));

    return {
      stage,
      count,
      dropOffRate,
    };
  });
};

const buildLeadVelocity = (leads: ManageLead[]): LeadVelocityPoint[] => {
  return stageOrder.map((stage) => {
    const scoped = leads.filter((lead) => lead.stage === stage);
    const avgTime =
      scoped.length === 0
        ? 0
        : scoped.reduce((sum, lead) => sum + toDaysSince(lead.updated_at || lead.created_at), 0) / scoped.length;

    return {
      stage,
      avgTime: Number(avgTime.toFixed(1)),
    };
  });
};

export const leadsAnalyticsService = {
  filterLeads,
  inferSourceBucket,

  buildAnalytics(leads: ManageLead[], filters: LeadsAnalysisFilters): LeadsAnalytics {
    const scoped = filterLeads(leads, filters);

    const totalLeads = scoped.length;
    const qualifiedLeads = scoped.filter((lead) => ["QUALIFIED", "RESPONDED", "NEGOTIATION"].includes(lead.stage)).length;
    const qualifiedLeadsPercent = totalLeads === 0 ? 0 : Number(((qualifiedLeads / totalLeads) * 100).toFixed(1));

    const avgScore =
      totalLeads === 0 ? 0 : Number((scoped.reduce((sum, lead) => sum + lead.score, 0) / totalLeads).toFixed(1));

    const movedToCrm = scoped.filter((lead) => ["NEGOTIATION", "CONTRACTED", "IN_PROGRESS", "CLOSED"].includes(lead.stage)).length;
    const conversionRate = totalLeads === 0 ? 0 : Number(((movedToCrm / totalLeads) * 100).toFixed(1));

    const highIntentCount = scoped.filter((lead) => lead.score >= 70).length;

    const scoreDistribution = [
      { range: "0-30", count: scoped.filter((lead) => lead.score <= 30).length },
      { range: "31-60", count: scoped.filter((lead) => lead.score > 30 && lead.score <= 60).length },
      { range: "61-100", count: scoped.filter((lead) => lead.score > 60).length },
    ];

    const sourcePerformance = buildSourcePerformance(scoped);
    const stageConversion = buildStageConversion(scoped);
    const leadVelocity = buildLeadVelocity(scoped);

    return {
      totalLeads,
      qualifiedLeads,
      qualifiedLeadsPercent,
      avgScore,
      conversionRate,
      highIntentCount,
      scoreDistribution,
      sourcePerformance,
      stageConversion,
      leadVelocity,
    };
  },

  buildAIInsights(leads: ManageLead[], analytics: LeadsAnalytics): LeadsAIInsights {
    const bestSource = [...analytics.sourcePerformance].sort((a, b) => b.highIntentRate - a.highIntentRate)[0];
    const weakestSource = [...analytics.sourcePerformance].sort((a, b) => a.highIntentRate - b.highIntentRate)[0];
    const funnelBottleneck = [...analytics.stageConversion].sort((a, b) => b.dropOffRate - a.dropOffRate)[0];

    const bestLeadsToday = [...leads]
      .filter((lead) => lead.score >= 75 && !["NEGOTIATION", "CONTRACTED", "IN_PROGRESS", "CLOSED"].includes(lead.stage))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      insights: [
        `${bestSource?.source ?? "manual"} leads deliver the highest high-intent rate at ${bestSource?.highIntentRate ?? 0}%.`,
        `${analytics.highIntentCount} leads are currently high intent and ready for accelerated follow-up.`,
        `Average lead score is ${analytics.avgScore}, indicating ${analytics.avgScore >= 65 ? "healthy" : "mixed"} pipeline quality.`,
      ],
      actions: [
        `Prioritize outreach to top ${bestLeadsToday.length} high-intent leads today.`,
        `Reduce bottleneck at ${funnelBottleneck?.stage ?? "CONTACTED"} with 12-hour follow-up automation.`,
        `Trim low-quality intake from ${weakestSource?.source ?? "manual"} and tighten qualification rules.`,
      ],
      warning: `${funnelBottleneck?.dropOffRate ?? 0}% drop-off detected around ${funnelBottleneck?.stage ?? "CONTACTED"}.`,
      bestLeadsToday,
    };
  },
};
