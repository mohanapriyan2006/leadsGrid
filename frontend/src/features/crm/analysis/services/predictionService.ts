import type { DealStatus } from "../../../common/types/ui";
import type { Deal } from "../../types/crm";
import type { CRMAnalytics, Prediction } from "../types/analytics";

const PROBABILITY_BY_STAGE: Record<DealStatus, number> = {
  negotiation: 0.6,
  contracted: 0.78,
  "in-progress": 0.9,
  closed: 1,
};

const safeNumber = (value: string) => Number(value.replace(/[$,]/g, "") || "0");

const getStageLeader = (analytics: CRMAnalytics): string => {
  const sorted = [...analytics.conversionFunnel]
    .slice(1)
    .sort((a, b) => b.conversionFromPrevious - a.conversionFromPrevious);

  return sorted[0]?.label ?? "Negotiation";
};

export const predictionService = {
  buildPrediction(deals: Deal[], analytics: CRMAnalytics): Prediction {
    const expectedRevenue = deals.reduce(
      (sum, deal) => sum + safeNumber(deal.value) * PROBABILITY_BY_STAGE[deal.status],
      0,
    );

    const closingDeals = deals
      .filter((deal) => deal.status !== "closed")
      .filter((deal) => PROBABILITY_BY_STAGE[deal.status] >= 0.75 || deal.score >= 85)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const atRiskDeals = deals
      .filter((deal) => deal.status !== "closed")
      .filter((deal) => deal.daysInStage > 18 || deal.score < 55)
      .sort((a, b) => b.daysInStage - a.daysInStage)
      .slice(0, 6);

    const sampleSizeFactor = Math.min(1, deals.length / 25);
    const qualityFactor = Math.min(1, analytics.winRate / 100 + 0.35);
    const confidenceScore = Number((sampleSizeFactor * qualityFactor * 100).toFixed(1));

    return {
      expectedRevenue: Number(expectedRevenue.toFixed(2)),
      closingDeals,
      atRiskDeals,
      confidenceScore,
      bestStageConversion: getStageLeader(analytics),
    };
  },
};
