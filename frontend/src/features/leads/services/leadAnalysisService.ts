import { apiClient } from "../../../lib/api";
import { getFirebaseAuth } from "../../../lib/firebase";

export type LeadIntent = {
  score: number;
  urgency: "low" | "medium" | "high";
  budget: "low" | "medium" | "high" | "unknown";
  decision_maker: "yes" | "no" | "unknown";
  pain_point: string;
  lead_type: "job" | "complaint" | "learning" | "hiring";
};

export type AdvancedLeadIntent = {
  score: number;
  urgency: "low" | "medium" | "high";
  buying_signals: string[];
  decision_maker: "yes" | "no" | "unknown";
  pain_point: string;
  details: string;
  category: "hiring" | "problem" | "switching" | "learning" | "discussion";
  status: "qualified" | "unqualified";
};

export type LeadValidation = {
  is_valid_lead: boolean;
  reason: string;
};

export type OutreachMessage = {
  message: string;
};

export type FollowUpMessage = {
  message: string;
};

export type ActionSuggestion = {
  action: "ignore" | "save" | "contact_now";
  reason: string;
};

export type PortfolioMatch = {
  project_name: string;
  why_match: string;
};

export type LeadAnalysisResult = {
  intent: LeadIntent;
  validation: LeadValidation;
  outreach: OutreachMessage;
  follow_up: FollowUpMessage;
  action: ActionSuggestion;
  portfolio_match: PortfolioMatch | null;
};

export type AnalyzeLeadPayload = {
  lead_text: string;
  lead_title?: string;
  lead_author?: string;
  score?: number;
};

const getAuthHeaders = async () => {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) {
    return {};
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "x-user-id": user.uid,
  };
};

export const leadAnalysisService = {
  analyzeLead: async (payload: AnalyzeLeadPayload): Promise<LeadAnalysisResult> => {
    const headers = await getAuthHeaders();
    const response = await apiClient.post<LeadAnalysisResult>("/leads/analyze", payload, { headers });
    return response.data;
  },

  analyzeIntent: async (payload: AnalyzeLeadPayload): Promise<LeadIntent> => {
    const headers = await getAuthHeaders();
    const response = await apiClient.post<LeadIntent>("/leads/analyze-intent", payload, { headers });
    return response.data;
  },

  analyzeAdvancedIntent: async (payload: AnalyzeLeadPayload): Promise<AdvancedLeadIntent> => {
    const headers = await getAuthHeaders();
    const response = await apiClient.post<AdvancedLeadIntent>("/leads/analyze-advanced-intent", payload, { headers });
    return response.data;
  },

  validateLead: async (payload: AnalyzeLeadPayload): Promise<LeadValidation> => {
    const headers = await getAuthHeaders();
    const response = await apiClient.post<LeadValidation>("/leads/validate", payload, { headers });
    return response.data;
  },

  generateOutreach: async (payload: AnalyzeLeadPayload): Promise<OutreachMessage> => {
    const headers = await getAuthHeaders();
    const response = await apiClient.post<OutreachMessage>("/leads/generate-outreach", payload, { headers });
    return response.data;
  },

  suggestAction: async (payload: AnalyzeLeadPayload): Promise<ActionSuggestion> => {
    const headers = await getAuthHeaders();
    const response = await apiClient.post<ActionSuggestion>("/leads/suggest-action", payload, { headers });
    return response.data;
  },
};
