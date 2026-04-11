import { useMemo, useState } from "react";

import type { Deal } from "../../types/crm";
import { analyticsService } from "../services/analyticsService";
import type { AnalyticsDateRange, PipelineFilter } from "../types/analytics";

export const useCRMAnalytics = (deals: Deal[]) => {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>("30d");
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("all");

  const filteredDeals = useMemo(
    () => analyticsService.filterDeals(deals, dateRange, pipelineFilter),
    [deals, dateRange, pipelineFilter],
  );

  const analytics = useMemo(
    () => analyticsService.buildAnalytics(deals, dateRange, pipelineFilter),
    [deals, dateRange, pipelineFilter],
  );

  return {
    filteredDeals,
    analytics,
    dateRange,
    setDateRange,
    pipelineFilter,
    setPipelineFilter,
  };
};
