import { useCallback, useEffect, useMemo, useState } from "react";

import { useCentralizedLeads } from "../../leads/hooks/useCentralizedLeads";
import { leadService } from "../../leads/services/leadService";
import type { ManageLeadAnalytics, ManageLeadInsights } from "../../leads/types/manageLead";
import { buildDashboardViewModel } from "../utils/dashboardMetrics";

export const useDashboardData = () => {
  const { leads, loading: leadsLoading, error: leadsError } = useCentralizedLeads();
  const [insights, setInsights] = useState<ManageLeadInsights | null>(null);
  const [analytics, setAnalytics] = useState<ManageLeadAnalytics | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setServiceError(null);

    try {
      const [nextInsights, nextAnalytics] = await Promise.all([
        leadService.getManageLeadInsights(),
        leadService.getManageLeadAnalytics(),
      ]);
      setInsights(nextInsights);
      setAnalytics(nextAnalytics);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load dashboard analytics";
      setServiceError(message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 45000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refresh]);

  const loading = leadsLoading || (!insights && !analytics && refreshing);
  const error = leadsError?.message ?? serviceError;

  return useMemo(
    () => ({
      ...buildDashboardViewModel({
        leads,
        insights,
        analytics,
        loading,
        error,
      }),
      refresh,
      refreshing,
    }),
    [analytics, error, insights, leads, loading, refresh, refreshing],
  );
};
