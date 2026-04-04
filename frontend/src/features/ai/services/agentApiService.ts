import { apiClient, getStoredToken } from "../../../lib/api";
import { getFirebaseAuth } from "../../../lib/firebase";
import type { Lead } from "../../leads/types/lead";
import type { AgentActionType, AgentPlan, AgentStep } from "../types/agent";

export type AgentActionResult = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
};

type BackendLead = {
  id: string;
  title: string;
  summary: string;
  content: string;
  platform: string;
  score: number;
  upvotes: number;
  url: string | null;
  author: string;
  email: string | null;
};

const toBackendLead = (lead: Lead): BackendLead => ({
  id: lead.id,
  title: lead.title || lead.summary || lead.author,
  summary: lead.summary,
  content: lead.content,
  platform: lead.source,
  score: lead.score,
  upvotes: 0,
  url: lead.permalink || null,
  author: lead.author,
  email: lead.email || null,
});

const buildHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};
  const auth = getFirebaseAuth();

  if (auth?.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
    headers["x-user-id"] = auth.currentUser.uid;
    return headers;
  }

  const storedToken = getStoredToken();
  if (storedToken) {
    headers.Authorization = `Bearer ${storedToken}`;
  }

  return headers;
};

export const agentApiService = {
  createPlan: async (prompt: string, leads: Lead[]): Promise<AgentPlan> => {
    const headers = await buildHeaders();
    const response = await apiClient.post<{ plan: AgentPlan }>(
      "/agent/plan",
      {
        prompt,
        leads: leads.map(toBackendLead),
      },
      { headers },
    );

    return response.data.plan;
  },

  executeStep: async (
    step: AgentStep,
    prompt: string,
    leads: Lead[],
    tone: string,
  ): Promise<AgentActionResult> => {
    const headers = await buildHeaders();
    const response = await apiClient.post<AgentActionResult>(
      "/agent/execute",
      {
        step,
        prompt,
        leads: leads.map(toBackendLead),
        tone,
        autoSave: true,
      },
      { headers },
    );

    return response.data;
  },
};
