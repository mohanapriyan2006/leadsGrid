import { useQuery } from "@tanstack/react-query";

import { useLeadStore } from "../../../store/useLeadStore";
import { leadService } from "../services/leadService";

export const useLeads = (params: { query: string; source: "reddit" | "twitter" | "linkedin"; limit?: number }) => {
  const { leads, setLeads } = useLeadStore();

  const leadsQuery = useQuery({
    queryKey: ["leads", params.query, params.source, params.limit ?? 12],
    enabled: params.query.trim().length > 2,
    queryFn: async () => {
      const leadList = await leadService.discoverLeads({
        query: params.query,
        source: params.source,
        limit: params.limit ?? 12,
      });
      setLeads(leadList);
      return leadList;
    },
    staleTime: 20_000,
    refetchInterval: 25_000,
  });

  return {
    leads: leads.length ? leads : leadsQuery.data ?? [],
    isLoading: leadsQuery.isLoading,
    isFetching: leadsQuery.isFetching,
    error: leadsQuery.error,
  };
};
