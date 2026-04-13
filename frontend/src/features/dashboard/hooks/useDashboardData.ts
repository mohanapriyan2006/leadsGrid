import { useCallback, useMemo, useState } from "react";

import { useCentralizedLeads } from "../../leads/hooks/useCentralizedLeads";
import { buildManageLeadAnalytics, buildManageLeadInsights } from "../../leads/services/leadMetrics";
import { buildDashboardViewModel } from "../utils/dashboardMetrics";

export const useDashboardData = () => {
  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    refresh: refreshLeads,
  } = useCentralizedLeads({ pageSize: 120 });
  const insights = useMemo(() => buildManageLeadInsights(leads), [leads]);
  const analytics = useMemo(() => buildManageLeadAnalytics(leads), [leads]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedIso, setLastUpdatedIso] = useState(() => new Date().toISOString());

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLeads();
    setLastUpdatedIso(new Date().toISOString());
    setRefreshing(false);
  }, [refreshLeads]);

  const loading = leadsLoading;
  const error = leadsError?.message ?? null;

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
      lastUpdatedIso,
    }),
    [analytics, error, insights, leads, loading, refresh, refreshing, lastUpdatedIso],
  );
};
