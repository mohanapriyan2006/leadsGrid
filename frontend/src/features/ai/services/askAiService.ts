const REQUEST_TIMEOUT_MS = 14000;

import type { AIContextPayload } from "../types/context";
import { usageTracker } from "../../billing/services/usageTracker";
import { showLimitModal } from "../../billing/hooks/useLimitModal";

type AskProvider = "gemini" | "groq" | "openrouter";
type AskStrategy = "outreach_generator" | "lead_analyzer" | "follow_up_planner" | "general";

export type AskAiResult = {
  text: string;
  provider: AskProvider;
  confidence: number;
  requiresAgent: boolean;
};

const getEnv = (name: string): string => {
  const value = (import.meta.env[name] as string | undefined) || "";
  return value.trim();
};

const hasEnv = (name: string): boolean => {
  return getEnv(name).length > 0;
};

const withTimeout = async <T>(promiseFactory: (signal: AbortSignal) => Promise<T>) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await promiseFactory(controller.signal);
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const normalizeText = (value: string): string => {
  return value.replace(/\n{3,}/g, "\n\n").trim();
};

const shouldSuggestAgentMode = (prompt: string, responseText: string): boolean => {
  const text = `${prompt} ${responseText}`.toLowerCase();
  const actionKeywords = [
    "find leads",
    "discover leads",
    "send email",
    "execute",
    "automate",
    "schedule",
    "update crm",
    "run task",
    "bulk",
  ];

  return actionKeywords.some((keyword) => text.includes(keyword));
};

const routePrompt = (prompt: string, context?: AIContextPayload): AskStrategy => {
  const text = prompt.toLowerCase();

  if (text.includes("follow up") || text.includes("follow-up") || text.includes("nudge")) {
    return "follow_up_planner";
  }

  if (text.includes("analyze") || text.includes("score") || text.includes("intent") || text.includes("qualify")) {
    return "lead_analyzer";
  }

  if (text.includes("email") || text.includes("proposal") || text.includes("message") || text.includes("outreach")) {
    return "outreach_generator";
  }

  if ((context?.leads_context?.length || 0) > 0 && (text.includes("best lead") || text.includes("priority"))) {
    return "lead_analyzer";
  }

  return "general";
};

const strategyInstruction: Record<AskStrategy, string> = {
  outreach_generator: "Generate outreach copy with clear personalization, soft CTA, and practical next steps.",
  lead_analyzer: "Prioritize and explain lead quality, urgency, and best next actions with short rationale.",
  follow_up_planner: "Create concise follow-up strategy with timing suggestions and low-friction call to action.",
  general: "Provide concise, actionable sales assistance with practical recommendations.",
};

const serializeContext = (context?: AIContextPayload): string => {
  if (!context) return "";

  const compactContext = {
    schema_version: context.schema_version,
    tone: context.tone,
    pipeline_snapshot: context.pipeline_snapshot,
    memory: context.memory,
    leads_context: context.leads_context.slice(0, 8).map((lead) => ({
      name: lead.name,
      company: lead.company,
      pain_point: lead.pain_point,
      intent_score: lead.intent_score,
      urgency: lead.urgency,
      budget_hint: lead.budget_hint,
      recommended_pitch: lead.recommended_pitch,
      confidence: lead.confidence,
    })),
  };

  return JSON.stringify(compactContext, null, 2).slice(0, 2800);
};

const buildAskPrompt = (input: { prompt: string; tone: string; maxWords: number; context?: AIContextPayload }) => {
  const strategy = routePrompt(input.prompt, input.context);
  const contextBlock = serializeContext(input.context);

  return [
    "You are PitchPilot Ask Mode assistant.",
    `Strategy: ${strategy}`,
    strategyInstruction[strategy],
    "Rules:",
    "1) Return plain text only. No markdown tables, no JSON.",
    "2) Keep response concise and practical.",
    "3) If user intent needs execution/automation, include one sentence suggesting Agent mode.",
    `Tone: ${input.tone}`,
    `Max words: ${input.maxWords}`,
    contextBlock ? "Structured context:" : "",
    contextBlock,
    "User request:",
    input.prompt,
  ].join("\n");
};

const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = getEnv("VITE_GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  return withTimeout(async (signal) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status})`);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || typeof text !== "string") {
      throw new Error("Gemini returned empty content");
    }

    return normalizeText(text);
  });
};

const callGroq = async (prompt: string): Promise<string> => {
  const apiKey = getEnv("VITE_GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("Missing VITE_GROQ_API_KEY");
  }

  const model = getEnv("VITE_GROQ_MODEL") || "llama-3.1-8b-instant";

  return withTimeout(async (signal) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq request failed (${response.status})`);
    }

    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    if (!text || typeof text !== "string") {
      throw new Error("Groq returned empty content");
    }

    return normalizeText(text);
  });
};

const callOpenRouter = async (prompt: string): Promise<string> => {
  const apiKey = getEnv("VITE_OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new Error("Missing VITE_OPENROUTER_API_KEY");
  }

  const model = getEnv("VITE_OPENROUTER_MODEL") || "openai/gpt-4o-mini";

  return withTimeout(async (signal) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed (${response.status})`);
    }

    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;
    if (!text || typeof text !== "string") {
      throw new Error("OpenRouter returned empty content");
    }

    return normalizeText(text);
  });
};

export const askAiService = {
  generateText: async (input: { prompt: string; tone: string; maxWords: number; context?: AIContextPayload }): Promise<AskAiResult> => {
    const limitCheck = await usageTracker.checkLimit("ask_ai_per_month", 1);
    if (!limitCheck.allowed) {
      showLimitModal({ action: "ask_ai_per_month", current: limitCheck.current, limit: limitCheck.limit });
      throw new Error("Plan limit reached: Ask AI Credits");
    }

    const prompt = buildAskPrompt(input);
    const strategy = routePrompt(input.prompt, input.context);
    const providers: Array<{ name: AskProvider; run: () => Promise<string> }> = [];

    if (hasEnv("VITE_GEMINI_API_KEY")) {
      providers.push({ name: "gemini", run: () => callGemini(prompt) });
    }
    if (hasEnv("VITE_GROQ_API_KEY")) {
      providers.push({ name: "groq", run: () => callGroq(prompt) });
    }
    if (hasEnv("VITE_OPENROUTER_API_KEY")) {
      providers.push({ name: "openrouter", run: () => callOpenRouter(prompt) });
    }

    if (providers.length === 0) {
      throw new Error(
        "No AI provider keys configured. Set at least one of VITE_GEMINI_API_KEY, VITE_GROQ_API_KEY, or VITE_OPENROUTER_API_KEY in frontend/.env and restart Vite.",
      );
    }

    const providerErrors: string[] = [];
    for (const provider of providers) {
      try {
        const text = await provider.run();
        await usageTracker.incrementUsage("ask_ai_per_month", 1);
        return {
          text,
          provider: provider.name,
          confidence: provider.name === "gemini" ? 92 : provider.name === "groq" ? 86 : 82,
          requiresAgent: strategy !== "general" || shouldSuggestAgentMode(input.prompt, text),
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown provider error";
        providerErrors.push(`${provider.name}: ${reason}`);
      }
    }

    throw new Error(`All configured AI providers failed. ${providerErrors.join(" | ")}`);
  },
};
