import type { CRMAnalytics, Prediction, AIInsights } from "../types/analytics";

const getBottleneckStage = (analytics: CRMAnalytics) => {
  const funnel = analytics.conversionFunnel.filter((point) => point.label !== "Negotiation");
  return funnel.sort((a, b) => a.conversionFromPrevious - b.conversionFromPrevious)[0];
};

const getSlowStage = (analytics: CRMAnalytics) => {
  return [...analytics.dealVelocity].sort((a, b) => b.avgDays - a.avgDays)[0];
};

export const aiInsightsService = {
  buildInsights(analytics: CRMAnalytics, prediction: Prediction): AIInsights {
    const bottleneck = getBottleneckStage(analytics);
    const slowStage = getSlowStage(analytics);

    const insights = [
      `${bottleneck?.label ?? "Pipeline"} is the biggest drop-off point at ${bottleneck?.conversionFromPrevious ?? 0}% conversion.`,
      `${slowStage.stage} holds deals for an average of ${slowStage.avgDays} days, above your current close-time baseline.`,
      `${prediction.closingDeals.length} active deals look close-ready, contributing to near-term revenue momentum.`,
    ];

    const actions = [
      "Follow up all high-value negotiation deals within 24 hours.",
      "Prioritize at-risk deals with age > 18 days and score < 55.",
      `Replicate playbooks from ${prediction.bestStageConversion} where conversion is strongest.`,
    ];

    const risks = [
      prediction.atRiskDeals.length > 0
        ? `${prediction.atRiskDeals.length} deals are currently at risk due to low score or long stage duration.`
        : "No major risk cluster detected in the selected window.",
    ];

    const nextBestAction =
      prediction.atRiskDeals.length > prediction.closingDeals.length
        ? "Run a recovery sprint on at-risk deals before pushing new proposals."
        : "Focus on close-ready deals to maximize 30-day revenue.";

    return {
      insights,
      actions,
      risks,
      nextBestAction,
    };
  },
};
