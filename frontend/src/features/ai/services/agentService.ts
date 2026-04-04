import type { Lead } from "../../leads/types/lead";
import type { AgentActionType, AgentStep } from "../types/agent";
import { AGENT_ACTIONS } from "../constants/agentActions";
import { createId } from "../constants/aiPage";
import { agentApiService } from "./agentApiService";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type AgentActionResult = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
};

const executeLeadDiscovery = async (
  leads: Lead[],
  prompt: string,
): Promise<AgentActionResult> => {
  await delay(1200);

  const keywords = prompt.toLowerCase();
  let filtered = [...leads];

  if (keywords.includes("saas") || keywords.includes("software")) {
    filtered = filtered.filter(
      (l) =>
        l.content.toLowerCase().includes("saas") ||
        l.content.toLowerCase().includes("software") ||
        l.content.toLowerCase().includes("crm"),
    );
  }

  if (keywords.includes("react") || keywords.includes("developer")) {
    filtered = filtered.filter(
      (l) =>
        l.content.toLowerCase().includes("react") ||
        l.content.toLowerCase().includes("developer") ||
        l.content.toLowerCase().includes("engineering"),
    );
  }

  if (filtered.length === 0) filtered = leads.slice(0, 5);

  const sorted = filtered.sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, Math.min(10, sorted.length));

  return {
    success: true,
    message: `Found ${top.length} high-quality leads matching your criteria.`,
    data: {
      leads: top.map((l) => ({ id: l.id, author: l.author, score: l.score, summary: l.summary })),
      count: top.length,
    },
  };
};

const executeLeadScoring = async (leads: Lead[]): Promise<AgentActionResult> => {
  await delay(900);

  const scored = leads
    .map((l) => ({
      id: l.id,
      author: l.author,
      originalScore: l.score,
      adjustedScore: Math.min(100, l.score + Math.floor(Math.random() * 8)),
      signals: [
        l.budget ? "Budget confirmed" : null,
        l.urgency ? "High urgency" : null,
        l.email ? "Email available" : null,
        l.score > 80 ? "Strong intent" : null,
      ].filter(Boolean),
    }))
    .sort((a, b) => b.adjustedScore - a.adjustedScore);

  return {
    success: true,
    message: `Scored ${scored.length} leads. Top lead: ${scored[0]?.author} (${scored[0]?.adjustedScore}%)`,
    data: { scoredLeads: scored, topLead: scored[0] },
  };
};

const executeCRMUpdate = async (
  leads: Lead[],
  prompt: string,
): Promise<AgentActionResult> => {
  await delay(800);

  const keywords = prompt.toLowerCase();
  const affectedLeads = leads.slice(0, 3);
  const actions: string[] = [];

  if (keywords.includes("tag") || keywords.includes("label")) {
    actions.push(`Tagged ${affectedLeads.length} leads with "high-priority"`);
  }
  if (keywords.includes("move") || keywords.includes("stage")) {
    actions.push(`Moved ${affectedLeads.length} leads to next stage`);
  }
  if (keywords.includes("delete") || keywords.includes("remove")) {
    actions.push(`Marked ${affectedLeads.length} leads for review`);
  }
  if (actions.length === 0) {
    actions.push(`Updated ${affectedLeads.length} lead records in CRM`);
  }

  return {
    success: true,
    message: actions.join(". ") + ".",
    data: {
      affectedLeads: affectedLeads.map((l) => l.author),
      actions,
    },
  };
};

const executeMessageDraft = async (
  leads: Lead[],
  tone: string,
): Promise<AgentActionResult> => {
  await delay(1500);

  const topLead = leads.sort((a, b) => b.score - a.score)[0];
  if (!topLead) {
    return { success: false, message: "No leads available to draft messages for." };
  }

  const templates: Record<string, string> = {
    professional: `Dear ${topLead.author},\n\nI noticed your interest in ${topLead.summary.split(".")[0].toLowerCase()}. Our platform addresses this directly with AI-powered lead discovery and pipeline management.\n\nWould you be open to a brief 15-minute call this week?\n\nBest regards`,
    friendly: `Hey ${topLead.author}! 👋\n\nSaw your post about ${topLead.summary.split(".")[0].toLowerCase()} — totally get that pain point. We built something that might help.\n\nWant to hop on a quick call?`,
    direct: `${topLead.author},\n\n${topLead.summary.split(".")[0]}. We solve this.\n\nFree for 10 min this week?\n\nLet me know.`,
  };

  const draft = templates[tone] || templates.professional;

  return {
    success: true,
    message: `Drafted ${tone} outreach for ${topLead.author}.`,
    data: { draft, leadName: topLead.author, leadEmail: topLead.email },
  };
};

const executeFollowUpSchedule = async (leads: Lead[]): Promise<AgentActionResult> => {
  await delay(700);

  const leadsNeedingFollowUp = leads
    .filter((l) => l.score > 60)
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      author: l.author,
      followUpDate: new Date(Date.now() + Math.floor(Math.random() * 3 + 1) * 86400000).toLocaleDateString(),
      reason: l.score > 80 ? "High intent — follow up soon" : "Moderate interest — nurture",
    }));

  return {
    success: true,
    message: `Scheduled ${leadsNeedingFollowUp.length} follow-ups over the next 3 days.`,
    data: { followUps: leadsNeedingFollowUp },
  };
};

export const agentService = {
  executeAction: async (
    actionType: AgentActionType,
    leads: Lead[],
    prompt: string,
    tone: string,
  ): Promise<AgentActionResult> => {
    try {
      return await agentApiService.executeStep(actionType === "lead_discovery"
        ? {
            id: createId(),
            label: AGENT_ACTIONS.lead_discovery.label,
            description: "Discover leads",
            actionType,
            status: "pending",
            riskLevel: "low",
          }
        : {
            id: createId(),
            label: AGENT_ACTIONS[actionType].label,
            description: AGENT_ACTIONS[actionType].description,
            actionType,
            status: "pending",
            riskLevel: AGENT_ACTIONS[actionType].riskLevel,
          }, prompt, leads, tone);
    } catch {
      // Fallback keeps Agent mode usable while backend is unavailable.
    }

    switch (actionType) {
      case "lead_discovery":
        return executeLeadDiscovery(leads, prompt);
      case "lead_scoring":
        return executeLeadScoring(leads);
      case "crm_update":
        return executeCRMUpdate(leads, prompt);
      case "message_draft":
        return executeMessageDraft(leads, tone);
      case "follow_up_schedule":
        return executeFollowUpSchedule(leads);
      default:
        return { success: false, message: "Unknown action type." };
    }
  },

  buildPlanFromApi: async (prompt: string, leads: Lead[]): Promise<AgentStep[]> => {
    try {
      const plan = await agentApiService.createPlan(prompt, leads);
      return plan.steps;
    } catch {
      return agentService.buildPlan(prompt, leads);
    }
  },

  buildPlan: (prompt: string, leads: Lead[]): AgentStep[] => {
    const lower = prompt.toLowerCase();
    const steps: AgentStep[] = [];

    const hasDiscovery = lower.includes("find") || lower.includes("search") || lower.includes("discover");
    const hasScoring = lower.includes("score") || lower.includes("rank") || lower.includes("rate") || lower.includes("quality");
    const hasCRM = lower.includes("save") || lower.includes("update") || lower.includes("move") || lower.includes("crm") || lower.includes("tag");
    const hasMessage = lower.includes("send") || lower.includes("outreach") || lower.includes("email") || lower.includes("draft") || lower.includes("message");
    const hasFollowUp = lower.includes("follow") || lower.includes("schedule") || lower.includes("remind");

    if (hasDiscovery || (!hasScoring && !hasCRM && !hasMessage && !hasFollowUp)) {
      steps.push({
        id: createId(),
        label: AGENT_ACTIONS.lead_discovery.label,
        description: `Search leads from available sources matching: "${prompt.slice(0, 50)}"`,
        actionType: "lead_discovery",
        status: "pending",
        riskLevel: "low",
      });
    }

    if (hasScoring || hasDiscovery) {
      steps.push({
        id: createId(),
        label: AGENT_ACTIONS.lead_scoring.label,
        description: `Filter and score ${leads.length > 0 ? leads.length : "discovered"} leads by quality`,
        actionType: "lead_scoring",
        status: "pending",
        riskLevel: "low",
      });
    }

    if (hasCRM || hasDiscovery) {
      steps.push({
        id: createId(),
        label: AGENT_ACTIONS.crm_update.label,
        description: "Save qualified leads to CRM pipeline",
        actionType: "crm_update",
        status: "pending",
        riskLevel: "medium",
      });
    }

    if (hasMessage) {
      steps.push({
        id: createId(),
        label: AGENT_ACTIONS.message_draft.label,
        description: "Generate personalized outreach messages",
        actionType: "message_draft",
        status: "pending",
        riskLevel: "medium",
      });
    }

    if (hasFollowUp) {
      steps.push({
        id: createId(),
        label: AGENT_ACTIONS.follow_up_schedule.label,
        description: "Schedule follow-up reminders for top leads",
        actionType: "follow_up_schedule",
        status: "pending",
        riskLevel: "low",
      });
    }

    if (steps.length === 0) {
      steps.push(
        {
          id: createId(),
          label: AGENT_ACTIONS.lead_discovery.label,
          description: `Interpret and search: "${prompt.slice(0, 60)}"`,
          actionType: "lead_discovery",
          status: "pending",
          riskLevel: "low",
        },
        {
          id: createId(),
          label: AGENT_ACTIONS.lead_scoring.label,
          description: "Score and rank results",
          actionType: "lead_scoring",
          status: "pending",
          riskLevel: "low",
        },
      );
    }

    return steps;
  },
};
