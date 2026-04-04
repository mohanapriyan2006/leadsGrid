const REQUEST_TIMEOUT_MS = 14000;

type AskProvider = "gemini" | "groq" | "openrouter";

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

const buildAskPrompt = (input: { prompt: string; tone: string; maxWords: number }) => {
  return [
    "You are PitchPilot Ask Mode assistant.",
    "Rules:",
    "1) Return plain text only. No markdown tables, no JSON.",
    "2) Keep response concise and practical.",
    "3) If user intent needs execution/automation, include one sentence suggesting Agent mode.",
    `Tone: ${input.tone}`,
    `Max words: ${input.maxWords}`,
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
  generateText: async (input: { prompt: string; tone: string; maxWords: number }): Promise<AskAiResult> => {
    const prompt = buildAskPrompt(input);
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
        return {
          text,
          provider: provider.name,
          confidence: provider.name === "gemini" ? 92 : provider.name === "groq" ? 86 : 82,
          requiresAgent: shouldSuggestAgentMode(input.prompt, text),
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown provider error";
        providerErrors.push(`${provider.name}: ${reason}`);
      }
    }

    throw new Error(`All configured AI providers failed. ${providerErrors.join(" | ")}`);
  },
};
