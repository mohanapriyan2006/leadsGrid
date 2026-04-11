import type { AgentActionType, RiskLevel, SmartSuggestion } from "../types/agent";

export type AgentActionDefinition = {
  type: AgentActionType;
  label: string;
  description: string;
  icon: string;
  riskLevel: RiskLevel;
};

export const AGENT_ACTIONS: Record<AgentActionType, AgentActionDefinition> = {
  lead_discovery: {
    type: "lead_discovery",
    label: "Lead Discovery",
    description: "Scan sources and find high-quality leads",
    icon: "🔍",
    riskLevel: "low",
  },
  lead_scoring: {
    type: "lead_scoring",
    label: "Lead Scoring",
    description: "Score and rank leads by quality signals",
    icon: "📊",
    riskLevel: "low",
  },
  crm_update: {
    type: "crm_update",
    label: "CRM Update",
    description: "Move stage, add tags, or update lead data",
    icon: "📝",
    riskLevel: "medium",
  },
  message_draft: {
    type: "message_draft",
    label: "Message Draft",
    description: "Generate personalized outreach messages",
    icon: "✉️",
    riskLevel: "medium",
  },
  follow_up_schedule: {
    type: "follow_up_schedule",
    label: "Follow-up Schedule",
    description: "Queue follow-up reminders and tasks",
    icon: "📅",
    riskLevel: "low",
  },
};

export const SMART_SUGGESTIONS: SmartSuggestion[] = [
  { id: "s1", label: "Find React leads", prompt: "Find leads looking for React developers", category: "discovery" },
  { id: "s2", label: "Write cold email", prompt: "Draft a cold outreach email for my top lead", category: "outreach" },
  { id: "s3", label: "Best lead today", prompt: "Who is the best lead to contact today?", category: "analysis" },
  { id: "s4", label: "Pipeline health", prompt: "Analyze my pipeline health and suggest moves", category: "pipeline" },
  { id: "s5", label: "Find SaaS leads", prompt: "Find high-intent SaaS leads from all sources", category: "discovery" },
  { id: "s6", label: "Follow-up needed", prompt: "Which leads need a follow-up today?", category: "pipeline" },
  { id: "s7", label: "Score my leads", prompt: "Score and rank all my current leads", category: "analysis" },
  { id: "s8", label: "Close strategy", prompt: "Give me a 1-click close strategy for my best lead", category: "outreach" },
];

export const TYPING_SUGGESTIONS: Record<string, string[]> = {
  find: ["Find React leads", "Find SaaS leads", "Find high-intent leads"],
  draft: ["Draft cold email", "Draft follow-up message", "Draft LinkedIn DM"],
  analyze: ["Analyze pipeline", "Analyze lead quality", "Analyze conversion rate"],
  score: ["Score my leads", "Score top 10 leads", "Score pipeline leads"],
  best: ["Best lead today", "Best lead to contact", "Best close opportunity"],
  send: ["Send outreach to top lead", "Send follow-up emails", "Send bulk outreach"],
  schedule: ["Schedule follow-ups", "Schedule calls with hot leads"],
  help: ["What can you do?", "Show me commands", "How does agent mode work?"],
};

export const AGENT_INTENT_KEYWORDS: Record<string, AgentActionType[]> = {
  find: ["lead_discovery"],
  search: ["lead_discovery"],
  discover: ["lead_discovery"],
  score: ["lead_scoring"],
  rank: ["lead_scoring"],
  rate: ["lead_scoring"],
  update: ["crm_update"],
  move: ["crm_update"],
  tag: ["crm_update"],
  delete: ["crm_update"],
  draft: ["message_draft"],
  write: ["message_draft"],
  email: ["message_draft"],
  message: ["message_draft"],
  outreach: ["lead_discovery", "message_draft"],
  "follow-up": ["follow_up_schedule"],
  followup: ["follow_up_schedule"],
  schedule: ["follow_up_schedule"],
  remind: ["follow_up_schedule"],
};
