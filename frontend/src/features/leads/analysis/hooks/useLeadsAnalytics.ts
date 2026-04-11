import { useMemo, useState } from "react";

import type { ManageLead, ManageLeadStage } from "../../types/manageLead";
import { leadsAnalyticsService } from "../services/leadsAnalyticsService";
import type {
  LeadSourceFilter,
  LeadsAnalysisFilters,
  LeadsAnalyticsRange,
  StageFilter,
} from "../types/leadsAnalytics";

export const useLeadsAnalytics = (leads: ManageLead[]) => {
  const [filters, setFilters] = useState<LeadsAnalysisFilters>({
    range: "30d",
    source: "all",
    stage: "all",
  });

  const filteredLeads = useMemo(() => leadsAnalyticsService.filterLeads(leads, filters), [leads, filters]);
  const analytics = useMemo(() => leadsAnalyticsService.buildAnalytics(leads, filters), [leads, filters]);
  const insights = useMemo(() => leadsAnalyticsService.buildAIInsights(filteredLeads, analytics), [filteredLeads, analytics]);

  const setRange = (range: LeadsAnalyticsRange) => {
    setFilters((prev) => ({ ...prev, range }));
  };

  const setSource = (source: LeadSourceFilter) => {
    setFilters((prev) => ({ ...prev, source }));
  };

  const setStage = (stage: StageFilter) => {
    setFilters((prev) => ({ ...prev, stage }));
  };

  return {
    filters,
    filteredLeads,
    analytics,
    insights,
    setRange,
    setSource,
    setStage,
  };
};
