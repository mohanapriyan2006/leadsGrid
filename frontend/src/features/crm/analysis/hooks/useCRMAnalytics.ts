import { useMemo, useState } from "react";

import type { Deal } from "../../types/crm";
import { analyticsService } from "../services/analyticsService";
import type { AnalyticsDateRange, PipelineFilter } from "../types/analytics";

export const useCRMAnalytics = (deals: Deal[]) => {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>("30d");
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("all");

  const analytics = useMemo(
    () => analyticsService.buildAnalytics(deals, dateRange, pipelineFilter),
    [deals, dateRange, pipelineFilter],
  );

  return {
    analytics,
    dateRange,
    setDateRange,
    pipelineFilter,
    setPipelineFilter,
  };
};
