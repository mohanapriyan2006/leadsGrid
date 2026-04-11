import type { ManageLead, ManageLeadStage } from "../../types/manageLead";

export type LeadsAnalyticsRange = "7d" | "30d" | "90d";
export type LeadSourceFilter = "all" | "reddit" | "linkedin" | "csv" | "manual";
export type LeadSourceBucket = Exclude<LeadSourceFilter, "all">;
export type StageFilter = "all" | ManageLeadStage;

export type ScoreBucket = {
  range: string;
  count: number;
};

export type SourcePerformance = {
  source: LeadSourceBucket;
  total: number;
  highIntent: number;
  highIntentRate: number;
};

export type StageConversionPoint = {
  stage: string;
  count: number;
  dropOffRate: number;
};

export type LeadVelocityPoint = {
  stage: string;
  avgTime: number;
};

export type LeadsAnalytics = {
  totalLeads: number;
  qualifiedLeads: number;
  qualifiedLeadsPercent: number;
  avgScore: number;
  conversionRate: number;
  highIntentCount: number;
  scoreDistribution: ScoreBucket[];
  sourcePerformance: SourcePerformance[];
  stageConversion: StageConversionPoint[];
  leadVelocity: LeadVelocityPoint[];
};

export type LeadPrediction = {
  highPotentialLeads: ManageLead[];
  lowQualityLeads: ManageLead[];
  conversionProbability: number;
  expectedConversions: number;
  highRoiLeads: ManageLead[];
  discardCandidates: ManageLead[];
};

export type LeadsAIInsights = {
  insights: string[];
  actions: string[];
  warning: string;
  bestLeadsToday: ManageLead[];
};

export type LeadsAnalysisFilters = {
  range: LeadsAnalyticsRange;
  source: LeadSourceFilter;
  stage: StageFilter;
};
