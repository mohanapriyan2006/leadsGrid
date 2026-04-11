import type { DealStatus } from "../../../common/types/ui";
import type { Deal } from "../../types/crm";

export type AnalyticsDateRange = "7d" | "30d" | "90d";
export type PipelineFilter = "all" | "active" | "won" | "lost";

export type StageCountPoint = {
  stage: DealStatus;
  label: string;
  count: number;
  value: number;
};

export type FunnelPoint = {
  label: string;
  value: number;
  conversionFromPrevious: number;
};

export type TrendPoint = {
  date: string;
  value: number;
};

export type VelocityPoint = {
  stage: DealStatus;
  avgDays: number;
};

export type CRMAnalytics = {
  totalDeals: number;
  totalValue: number;
  winRate: number;
  avgDealSize: number;
  avgCloseTime: number;
  stageDistribution: StageCountPoint[];
  conversionFunnel: FunnelPoint[];
  revenueTrend: TrendPoint[];
  dealVelocity: VelocityPoint[];
};

export type Prediction = {
  expectedRevenue: number;
  closingDeals: Deal[];
  atRiskDeals: Deal[];
  confidenceScore: number;
  bestStageConversion: string;
};

export type AIInsights = {
  insights: string[];
  actions: string[];
  risks: string[];
  nextBestAction: string;
};
