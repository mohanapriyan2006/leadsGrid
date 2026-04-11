import type { ToneType } from "../../common/types/ui";

export type AILeadUrgency = "low" | "medium" | "high";
export type AIBudgetHint = "low" | "mid" | "mid-high" | "high" | "unknown";

export type AIContextLead = {
  id: string;
  name: string;
  company: string;
  source: string;
  stage?: string;
  summary: string;
  pain_point: string;
  intent_score: number;
  urgency: AILeadUrgency;
  budget_hint: AIBudgetHint;
  recommended_pitch: string;
  confidence: number;
};

export type AIPipelineSnapshot = {
  total: number;
  hot: number;
  average_score: number;
  top_stage: string;
};

export type AIConversationMemory = {
  recent_prompts: string[];
  frequent_actions: string[];
  preferred_tone: ToneType;
};

export type AIContextPayload = {
  schema_version: "v1";
  generated_at: string;
  prompt: string;
  tone: ToneType;
  leads_context: AIContextLead[];
  attached_lead_ids: string[];
  pipeline_snapshot: AIPipelineSnapshot;
  memory: AIConversationMemory;
};
