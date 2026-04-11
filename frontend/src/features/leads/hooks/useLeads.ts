import { useQuery } from "@tanstack/react-query";

import { useLeadStore } from "../../../store/useLeadStore";
import { leadService } from "../services/leadService";
import type { Lead } from "../types/lead";

export const useLeads = (params: { query: string; selectedSources: Lead["source"][]; limit?: number }) => {
  const { leads, setLeads } = useLeadStore();
  const hasQuery = params.query.trim().length > 2;

  const leadsQuery = useQuery({
    queryKey: ["leads", params.query, params.selectedSources.join(","), params.limit ?? 12],
    enabled: hasQuery,
    queryFn: async () => {
      const leadList = await leadService.discoverLeads({
        query: params.query,
        limit: params.limit ?? 12,
        selectedSources: params.selectedSources,
      });
      setLeads(leadList);
      return leadList;
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return {
    leads: hasQuery ? (leads.length ? leads : leadsQuery.data ?? []) : [],
    isLoading: leadsQuery.isLoading,
    isFetching: leadsQuery.isFetching,
    error: leadsQuery.error,
  };
};
