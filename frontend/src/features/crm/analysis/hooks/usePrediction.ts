import { useMemo } from "react";

import type { Deal } from "../../types/crm";
import { aiInsightsService } from "../services/aiInsightsService";
import { predictionService } from "../services/predictionService";
import type { CRMAnalytics } from "../types/analytics";

export const usePrediction = (deals: Deal[], analytics: CRMAnalytics) => {
  const prediction = useMemo(() => predictionService.buildPrediction(deals, analytics), [deals, analytics]);
  const insights = useMemo(() => aiInsightsService.buildInsights(analytics, prediction), [analytics, prediction]);

  return {
    prediction,
    insights,
  };
};
