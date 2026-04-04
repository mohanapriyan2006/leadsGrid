import { apiClient, getStoredToken } from "../../../lib/api";
import { getFirebaseAuth } from "../../../lib/firebase";
import type { Lead } from "../../leads/types/lead";
import type { AgentActionType, AgentPlan, AgentRunStatus, AgentStep } from "../types/agent";

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
  created_at?: string | null;
};

export type AgentRunState = {
  runId: string;
  status: AgentRunStatus;
  plan: AgentPlan;
  currentStepIndex: number;
  completedSteps: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
  results: AgentActionResult[];
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
  created_at: lead.created_at || null,
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

  startRun: async (params: {
    prompt: string;
    leads: Lead[];
    tone: string;
    approvalMode: "all" | "step_by_step";
    autoApproveLowRisk: boolean;
    autoSave?: boolean;
  }): Promise<AgentRunState> => {
    const headers = await buildHeaders();
    const response = await apiClient.post<{ run: AgentRunState }>(
      "/agent/runs/start",
      {
        prompt: params.prompt,
        leads: params.leads.map(toBackendLead),
        tone: params.tone,
        approvalMode: params.approvalMode,
        autoApproveLowRisk: params.autoApproveLowRisk,
        autoSave: params.autoSave ?? true,
      },
      { headers },
    );

    return response.data.run;
  },

  getRunStatus: async (runId: string): Promise<AgentRunState> => {
    const headers = await buildHeaders();
    const response = await apiClient.get<{ run: AgentRunState }>(`/agent/runs/${runId}`, {
      headers,
    });
    return response.data.run;
  },

  approveStep: async (runId: string, autoApproveLowRisk: boolean): Promise<AgentRunState> => {
    const headers = await buildHeaders();
    const response = await apiClient.post<{ run: AgentRunState }>(
      `/agent/runs/${runId}/approve`,
      { autoApproveLowRisk },
      { headers },
    );
    return response.data.run;
  },

  skipStep: async (runId: string, autoApproveLowRisk: boolean): Promise<AgentRunState> => {
    const headers = await buildHeaders();
    const response = await apiClient.post<{ run: AgentRunState }>(
      `/agent/runs/${runId}/skip`,
      { autoApproveLowRisk },
      { headers },
    );
    return response.data.run;
  },

  abortRun: async (runId: string): Promise<AgentRunState> => {
    const headers = await buildHeaders();
    const response = await apiClient.post<{ run: AgentRunState }>(`/agent/runs/${runId}/abort`, {}, { headers });
    return response.data.run;
  },
};
