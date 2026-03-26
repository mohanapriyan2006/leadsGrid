import { apiClient, getStoredToken } from "../../../lib/api";
import type { Lead } from "../types/lead";

export const leadService = {
  discoverLeads: async (params: { query: string; source: Lead["source"]; limit: number }): Promise<Lead[]> => {
    const token = getStoredToken();
    const response = await apiClient.get<Lead[]>("/leads/discover", {
      params,
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },
};
