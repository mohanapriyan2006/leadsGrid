import { useMemo, useRef, useState } from "react";

import { AI_QUICK_ACTIONS, CHAT_RESPONSES } from "../../features/ai/constants/chatResponses";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export const AIPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Sales Engine initialized. I detected active high-intent prospects matching your ICP. Ask me for lead discovery, outreach drafts, or pipeline next-actions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt) {
      return;
    }

    setInput("");
    setMessages((current) => [...current, { role: "user", content: prompt }]);
    setLoading(true);

    await new Promise((resolve) => window.setTimeout(resolve, 700));
    const normalized = prompt.toLowerCase();
    let response = CHAT_RESPONSES.default;

    if (normalized.includes("lead") || normalized.includes("client") || normalized.includes("find")) {
      response = CHAT_RESPONSES.leads;
    } else if (normalized.includes("crm") || normalized.includes("pipeline") || normalized.includes("deal")) {
      response = CHAT_RESPONSES.crm;
    } else if (normalized.includes("message") || normalized.includes("draft") || normalized.includes("outreach")) {
      response = CHAT_RESPONSES.message;
    }

    setMessages((current) => [...current, { role: "assistant", content: response }]);
    setLoading(false);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const statusLabel = useMemo(() => (apiKey ? "Live AI active" : "Demo mode"), [apiKey]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-white/10 bg-panel/80 shadow-aura">
      {!apiKey && (
        <div className="flex items-center gap-3 border-b border-accent/30 bg-accent/10 px-4 py-2 text-xs">
          <span className="font-bold tracking-[0.1em] text-accent">DEMO MODE</span>
          <span className="text-text-dim">Add Anthropic API key for live provider responses.</span>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="sk-ant-..."
            className="ml-auto w-64 rounded border border-accent/40 bg-black/20 px-2 py-1 text-white"
          />
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[72%] rounded-xl border px-4 py-3 text-sm leading-7 ${message.role === "user" ? "border-accent/40 bg-accent/20 text-white" : "border-white/10 bg-black/20 text-white"}`}>
              {message.content}
            </div>
          </div>
        ))}

        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-text-dim">Synthesizing...</div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {AI_QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => setInput(action)}
            className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent"
          >
            {action}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <span className="text-xs text-text-dim">{statusLabel}</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void sendMessage();
            }
          }}
          placeholder="Ask the engine anything..."
          className="flex-1 rounded border border-accent/30 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
        <button onClick={() => void sendMessage()} disabled={loading} className="rounded bg-gradient-to-br from-accentSoft to-indigo-600 px-4 py-2 text-xs font-bold tracking-[0.1em] text-white disabled:opacity-60">
          SEND
        </button>
      </div>
    </div>
  );
};
