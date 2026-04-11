import type { AIMode, SmartSuggestion } from "../types/agent";

type SuggestionContext = {
  mode: AIMode;
  leadCount: number;
  manageLeadCount: number;
  topLeadName?: string;
};

const askSuggestions = (ctx: SuggestionContext): SmartSuggestion[] => {
  const topLead = ctx.topLeadName || "my top lead";

  if (ctx.leadCount === 0 && ctx.manageLeadCount === 0) {
    return [
      {
        id: "ask-empty-1",
        label: "Find new leads",
        prompt: "Find high-intent leads from Reddit, HackerNews, and web search",
        category: "discovery",
      },
      {
        id: "ask-empty-2",
        label: "Start pipeline",
        prompt: "Give me a simple pipeline plan for my first 10 leads",
        category: "pipeline",
      },
      {
        id: "ask-empty-3",
        label: "Write first outreach",
        prompt: "Write a friendly first outreach message for a SaaS lead",
        category: "outreach",
      },
    ];
  }

  return [
    {
      id: "ask-1",
      label: "Best lead today",
      prompt: "Who is the best lead to contact today and why?",
      category: "analysis",
    },
    {
      id: "ask-2",
      label: "Write outreach",
      prompt: `Write a concise outreach draft for ${topLead}`,
      category: "outreach",
    },
    {
      id: "ask-3",
      label: "Analyze pipeline",
      prompt: "Analyze my pipeline and suggest the next 3 actions",
      category: "pipeline",
    },
  ];
};

const agentSuggestions = (ctx: SuggestionContext): SmartSuggestion[] => {
  const hasPipeline = ctx.manageLeadCount > 0;

  if (!hasPipeline) {
    return [
      {
        id: "agent-new-1",
        label: "Find React leads",
        prompt: "Find React leads, score them, and save top 10 to CRM",
        category: "discovery",
      },
      {
        id: "agent-new-2",
        label: "Generate outreach",
        prompt: "Generate 10 personalized outreach drafts for top intent leads",
        category: "outreach",
      },
      {
        id: "agent-new-3",
        label: "Build workflow",
        prompt: "Create a weekly lead follow-up workflow and execution plan",
        category: "pipeline",
      },
    ];
  }

  return [
    {
      id: "agent-1",
      label: "Execute follow-ups",
      prompt: "Find leads needing follow-up, draft messages, and update CRM stages",
      category: "pipeline",
    },
    {
      id: "agent-2",
      label: "Find + score leads",
      prompt: "Find new high-intent leads and score the top 10 for outreach",
      category: "discovery",
    },
    {
      id: "agent-3",
      label: "Pipeline health",
      prompt: "Analyze pipeline health and execute the top 3 improvement actions",
      category: "analysis",
    },
  ];
};

export const getSmartSuggestions = (ctx: SuggestionContext): SmartSuggestion[] => {
  const suggestions = ctx.mode === "ask" ? askSuggestions(ctx) : agentSuggestions(ctx);
  return suggestions.slice(0, 3);
};

export const getTypingSuggestions = (ctx: SuggestionContext, inputValue: string): string[] => {
  const query = inputValue.trim().toLowerCase();
  if (query.length < 2) {
    return [];
  }

  const base = getSmartSuggestions(ctx).map((item) => item.prompt);
  const extra = [
    "Find high-intent leads",
    "Draft outreach message",
    "Analyze my pipeline",
    "Score and rank my leads",
    "What should I do next?",
  ];

  const candidates = [...new Set([...base, ...extra])];
  return candidates
    .filter((item) => item.toLowerCase().includes(query))
    .slice(0, 4);
};