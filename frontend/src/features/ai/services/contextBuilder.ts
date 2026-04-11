import type { ToneType } from "../../common/types/ui";
import type { ChatMessage, ChatSession } from "../types/chat";
import type {
  AIContextLead,
  AIContextPayload,
  AIBudgetHint,
  AILeadUrgency,
} from "../types/context";
import type { Lead } from "../../leads/types/lead";
import type { ManageLead } from "../../leads/types/manageLead";

type BuildAIContextInput = {
  prompt: string;
  tone: ToneType;
  leadPool: Lead[];
  manageLeads: ManageLead[];
  attachedLeads: Lead[];
  messages: ChatMessage[];
  chatHistory: ChatSession[];
  attachedLeadIds: string[];
};

const truncate = (value: string, max = 140): string => {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 3)}...`;
};

const inferUrgency = (score: number, explicit?: boolean): AILeadUrgency => {
  if (explicit) return "high";
  if (score >= 85) return "high";
  if (score >= 60) return "medium";
  return "low";
};

const inferBudgetHint = (lead: Lead): AIBudgetHint => {
  if (lead.budget === true && lead.score >= 85) return "mid-high";
  if (lead.budget === true) return "mid";
  if (lead.score >= 90) return "high";
  if (lead.score <= 40) return "low";
  return "unknown";
};

const extractPainPoint = (lead: Lead): string => {
  if (lead.pain_point && lead.pain_point.trim().length > 0) {
    return truncate(lead.pain_point.trim(), 110);
  }

  const summary = lead.summary?.trim() || lead.content?.trim() || "";
  if (!summary) return "Needs qualification";

  const firstSentence = summary.split(/[.!?]/)[0] || summary;
  return truncate(firstSentence, 110);
};

const recommendedPitch = (lead: Lead): string => {
  if (lead.category === "hiring") return "Hiring support + pre-vetted talent pipeline";
  if (lead.category === "problem") return "Rapid diagnosis + implementation support";
  if (lead.category === "switching") return "Migration plan with low-risk rollout";
  if (lead.score >= 80) return "Priority consult + implementation proposal";
  return "Discovery call to qualify requirements";
};

const buildLeadContext = (lead: Lead, stage?: string): AIContextLead => {
  const summarySource = lead.summary || lead.content || lead.title || "Lead needs qualification";

  return {
    id: lead.id,
    name: lead.author || "Unknown",
    company: lead.title || "Unknown company",
    source: lead.source,
    stage,
    summary: truncate(summarySource, 150),
    pain_point: extractPainPoint(lead),
    intent_score: lead.score,
    urgency: inferUrgency(lead.score, lead.urgency),
    budget_hint: inferBudgetHint(lead),
    recommended_pitch: recommendedPitch(lead),
    confidence: lead.ai_analysis ? 0.9 : lead.score >= 70 ? 0.78 : 0.62,
  };
};

const normalizeManageLead = (lead: ManageLead): Lead => ({
  id: lead.id,
  source: lead.source === "website" ? "search" : lead.source,
  author: lead.name,
  title: lead.company,
  content: lead.notes || `Lead from ${lead.company}`,
  summary: lead.notes || `Lead from ${lead.company}`,
  score: lead.score,
  tags: lead.notes ? [lead.source] : ["saved"],
  intent_label: "prospect",
  created_at: lead.created_at,
  email: lead.email || undefined,
  pain_point: lead.ai_analysis?.pain_points?.[0],
  category: lead.category === "hiring" || lead.category === "problem" || lead.category === "switching" || lead.category === "learning" || lead.category === "discussion" ? lead.category : undefined,
  urgency: lead.urgency === "high",
  budget: lead.budget_estimate > 0,
});

const pickFrequentActions = (texts: string[]): string[] => {
  const keywords = ["email", "follow-up", "proposal", "crm", "schedule", "analyze", "qualify"];
  const counts = new Map<string, number>();

  for (const text of texts) {
    const lower = text.toLowerCase();
    for (const key of keywords) {
      if (lower.includes(key)) {
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key]) => key);
};

export const buildStructuredAIContext = (input: BuildAIContextInput): AIContextPayload => {
  const attachedContext = input.attachedLeads.map((lead) => buildLeadContext(lead));

  const fallbackLeads = input.leadPool.slice(0, 6).map((lead) => buildLeadContext(lead));

  const pipelineLeads = input.manageLeads
    .slice(0, 4)
    .map((lead) => buildLeadContext(normalizeManageLead(lead), lead.stage));

  const leadsContext = attachedContext.length > 0
    ? [...attachedContext, ...pipelineLeads]
    : [...fallbackLeads, ...pipelineLeads];

  const avg = leadsContext.length
    ? leadsContext.reduce((acc, lead) => acc + lead.intent_score, 0) / leadsContext.length
    : 0;

  const stageCounts = input.manageLeads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + 1;
    return acc;
  }, {});

  const topStage = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "NEW";

  const recentPrompts = [
    ...input.messages.filter((msg) => msg.role === "user").slice(-5).map((msg) => msg.content),
    ...input.chatHistory.slice(0, 3).map((session) => session.title),
  ].map((value) => truncate(value, 80));

  return {
    schema_version: "v1",
    generated_at: new Date().toISOString(),
    prompt: input.prompt,
    tone: input.tone,
    leads_context: leadsContext.slice(0, 10),
    attached_lead_ids: input.attachedLeadIds,
    pipeline_snapshot: {
      total: input.manageLeads.length,
      hot: input.manageLeads.filter((lead) => lead.score >= 80).length,
      average_score: Number(avg.toFixed(1)),
      top_stage: topStage,
    },
    memory: {
      recent_prompts: recentPrompts,
      frequent_actions: pickFrequentActions(recentPrompts),
      preferred_tone: input.tone,
    },
  };
};

export const buildContextSummary = (context: AIContextPayload): string => {
  const leads = context.leads_context
    .slice(0, 8)
    .map((lead, index) => `${index + 1}. ${lead.name} @ ${lead.company} | score=${lead.intent_score} | pain=${lead.pain_point}`)
    .join("\n");

  return [
    "You are AI Sales Engine assistant.",
    "Goal: return concise actionable insights.",
    `Tone: ${context.tone}`,
    `User prompt: ${context.prompt}`,
    "Leads:",
    leads,
    `Pipeline: total=${context.pipeline_snapshot.total}, hot=${context.pipeline_snapshot.hot}, top_stage=${context.pipeline_snapshot.top_stage}`,
    context.memory.recent_prompts.length > 0
      ? `Recent prompts: ${context.memory.recent_prompts.join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
};
