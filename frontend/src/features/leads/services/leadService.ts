import { apiClient, getStoredToken } from "../../../lib/api";
import type { Lead } from "../types/lead";
import type {
  BinLead,
  BulkLeadAction,
  CSVImportResult,
  ManageLead,
  ManageLeadActionType,
  ManageLeadActivity,
  ManageLeadAnalytics,
  ManageLeadInsights,
  ManageLeadSource,
  ManageLeadStage,
  ManageLeadUrgency,
} from "../types/manageLead";

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

  listManageLeads: async (params: {
    query?: string;
    stage?: ManageLeadStage;
    source?: ManageLeadSource;
    min_score?: number;
    only_hot?: boolean;
    only_cold?: boolean;
    urgency?: ManageLeadUrgency;
  }): Promise<ManageLead[]> => {
    const token = getStoredToken();
    const response = await apiClient.get<ManageLead[]>("/leads/manage", {
      params,
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  getManageLeadInsights: async (): Promise<ManageLeadInsights> => {
    const token = getStoredToken();
    const response = await apiClient.get<ManageLeadInsights>("/leads/manage/insights", {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  getManageLeadAnalytics: async (): Promise<ManageLeadAnalytics> => {
    const token = getStoredToken();
    const response = await apiClient.get<ManageLeadAnalytics>("/leads/manage/analytics", {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  getManageLeadTimeline: async (leadId: string): Promise<ManageLeadActivity[]> => {
    const token = getStoredToken();
    const response = await apiClient.get<ManageLeadActivity[]>(`/leads/manage/${leadId}/timeline`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  updateManageLead: async (
    leadId: string,
    payload: {
      stage?: ManageLeadStage;
      notes?: string;
      email?: string;
      phone?: string;
      budget_estimate?: number;
      urgency?: ManageLeadUrgency;
    },
  ): Promise<ManageLead> => {
    const token = getStoredToken();
    const response = await apiClient.patch<ManageLead>(`/leads/manage/${leadId}`, payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  manageLeadAction: async (
    leadId: string,
    payload: { action_type: ManageLeadActionType; note?: string; target_stage?: ManageLeadStage },
  ): Promise<ManageLead> => {
    const token = getStoredToken();
    const response = await apiClient.post<ManageLead>(`/leads/manage/${leadId}/actions`, payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  runManageLeadAutomation: async (): Promise<{
    reminders_due: number;
    follow_ups_generated: number;
    leads_marked_cold: number;
  }> => {
    const token = getStoredToken();
    const response = await apiClient.post(
      "/leads/manage/automation/run",
      {},
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      },
    );
    return response.data;
  },

  createManageLead: async (payload: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
    stage?: ManageLeadStage;
    budget_estimate?: number;
  }): Promise<ManageLead> => {
    const token = getStoredToken();
    const response = await apiClient.post<ManageLead>("/leads/manage", payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  bulkManageLeadAction: async (payload: {
    lead_ids: string[];
    action: BulkLeadAction;
    target_stage?: ManageLeadStage;
  }): Promise<{ updated: number }> => {
    const token = getStoredToken();
    const response = await apiClient.post<{ updated: number }>("/leads/manage/bulk", payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  softDeleteManageLead: async (leadId: string): Promise<void> => {
    const token = getStoredToken();
    await apiClient.delete(`/leads/manage/${leadId}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
  },

  listManageLeadBin: async (): Promise<BinLead[]> => {
    const token = getStoredToken();
    const response = await apiClient.get<BinLead[]>("/leads/manage/bin", {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  restoreManageLead: async (leadId: string): Promise<void> => {
    const token = getStoredToken();
    await apiClient.post(
      `/leads/manage/bin/${leadId}/restore`,
      {},
      {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      },
    );
  },

  deleteManageLeadForever: async (leadId: string): Promise<void> => {
    const token = getStoredToken();
    await apiClient.delete(`/leads/manage/bin/${leadId}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
  },

  importManageLeadCSV: async (
    file: File,
    fieldMapping: Record<string, string>,
  ): Promise<CSVImportResult> => {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field_mapping", JSON.stringify(fieldMapping));
    const response = await apiClient.post<CSVImportResult>("/leads/import-csv", formData, {
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
