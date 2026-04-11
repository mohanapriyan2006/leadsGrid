import type { DealStatus } from "../../../common/types/ui";
import type { Deal } from "../../types/crm";
import type {
  AnalyticsDateRange,
  CRMAnalytics,
  FunnelPoint,
  PipelineFilter,
  StageCountPoint,
  TrendPoint,
  VelocityPoint,
} from "../types/analytics";

const STATUS_LABELS: Record<DealStatus, string> = {
  negotiation: "Negotiation",
  contracted: "Contracted",
  "in-progress": "In Progress",
  closed: "Closed",
};

const STATUS_ORDER: DealStatus[] = ["negotiation", "contracted", "in-progress", "closed"];

const safeNumber = (value: string) => Number(value.replace(/[$,]/g, "") || "0");

const getFilteredDeals = (
  deals: Deal[],
  dateRange: AnalyticsDateRange,
  pipelineFilter: PipelineFilter,
): Deal[] => {
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;

  const byRange = deals.filter((deal) => deal.daysInStage <= days || deal.status === "closed");

  switch (pipelineFilter) {
    case "active":
      return byRange.filter((deal) => deal.status !== "closed");
    case "won":
      return byRange.filter((deal) => deal.status === "closed" && deal.score >= 55);
    case "lost":
      return byRange.filter((deal) => deal.status === "closed" && deal.score < 55);
    default:
      return byRange;
  }
};

const buildStageDistribution = (deals: Deal[]): StageCountPoint[] => {
  return STATUS_ORDER.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.status === stage);
    return {
      stage,
      label: STATUS_LABELS[stage],
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + safeNumber(deal.value), 0),
    };
  });
};

const buildConversionFunnel = (stageDistribution: StageCountPoint[]): FunnelPoint[] => {
  return stageDistribution.map((point, index) => {
    if (index === 0) {
      return {
        label: point.label,
        value: point.count,
        conversionFromPrevious: 100,
      };
    }

    const previous = stageDistribution[index - 1]?.count ?? 0;
    const conversion = previous === 0 ? 0 : (point.count / previous) * 100;

    return {
      label: point.label,
      value: point.count,
      conversionFromPrevious: Number(conversion.toFixed(1)),
    };
  });
};

const buildRevenueTrend = (deals: Deal[]): TrendPoint[] => {
  const buckets = [
    { label: "0-7d", min: 0, max: 7 },
    { label: "8-14d", min: 8, max: 14 },
    { label: "15-21d", min: 15, max: 21 },
    { label: "22-30d", min: 22, max: 30 },
    { label: "31d+", min: 31, max: Number.POSITIVE_INFINITY },
  ];

  return buckets.map((bucket) => ({
    date: bucket.label,
    value: deals
      .filter((deal) => deal.daysInStage >= bucket.min && deal.daysInStage <= bucket.max)
      .reduce((sum, deal) => sum + safeNumber(deal.value), 0),
  }));
};

const buildDealVelocity = (deals: Deal[]): VelocityPoint[] => {
  return STATUS_ORDER.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.status === stage);
    const avgDays =
      stageDeals.length === 0
        ? 0
        : stageDeals.reduce((sum, deal) => sum + deal.daysInStage, 0) / stageDeals.length;

    return {
      stage,
      avgDays: Number(avgDays.toFixed(1)),
    };
  });
};

export const analyticsService = {
  filterDeals(
    deals: Deal[],
    dateRange: AnalyticsDateRange,
    pipelineFilter: PipelineFilter,
  ): Deal[] {
    return getFilteredDeals(deals, dateRange, pipelineFilter);
  },

  buildAnalytics(
    deals: Deal[],
    dateRange: AnalyticsDateRange,
    pipelineFilter: PipelineFilter,
  ): CRMAnalytics {
    const filteredDeals = getFilteredDeals(deals, dateRange, pipelineFilter);
    const stageDistribution = buildStageDistribution(filteredDeals);
    const conversionFunnel = buildConversionFunnel(stageDistribution);
    const revenueTrend = buildRevenueTrend(filteredDeals);
    const dealVelocity = buildDealVelocity(filteredDeals);

    const totalDeals = filteredDeals.length;
    const totalValue = filteredDeals.reduce((sum, deal) => sum + safeNumber(deal.value), 0);
    const closedDeals = filteredDeals.filter((deal) => deal.status === "closed");
    const wonDeals = closedDeals.filter((deal) => deal.score >= 55);
    const winRate = closedDeals.length === 0 ? 0 : (wonDeals.length / closedDeals.length) * 100;
    const avgDealSize = totalDeals === 0 ? 0 : totalValue / totalDeals;
    const avgCloseTime =
      closedDeals.length === 0
        ? 0
        : closedDeals.reduce((sum, deal) => sum + deal.daysInStage, 0) / closedDeals.length;

    return {
      totalDeals,
      totalValue: Number(totalValue.toFixed(2)),
      winRate: Number(winRate.toFixed(1)),
      avgDealSize: Number(avgDealSize.toFixed(2)),
      avgCloseTime: Number(avgCloseTime.toFixed(1)),
      stageDistribution,
      conversionFunnel,
      revenueTrend,
      dealVelocity,
    };
  },
};
