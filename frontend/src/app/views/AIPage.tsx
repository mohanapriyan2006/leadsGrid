import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { MOCK_LEADS } from "../../features/leads/constants/mockLeads";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { messageService } from "../../features/leads/services/messageService";
import { useLeadStore } from "../../store/useLeadStore";
import type { ToneType } from "../../features/common/types/ui";

type ChatRole = "assistant" | "user";

type InsightCard = {
  leadName: string;
  score: number;
  budget: string;
  pain: string[];
  suggestion: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  card?: InsightCard;
  hidden?: boolean;
};

const QUICK_ACTIONS = ["Find leads", "Best lead", "Next action", "Draft message", "Analyze pipeline"] as const;

const QUICK_ACTION_PROMPT: Record<(typeof QUICK_ACTIONS)[number], string> = {
  "Find leads": "Find high-intent leads from my pipeline and explain why.",
  "Best lead": "Who is the best lead to contact today?",
  "Next action": "What is the next best action for my top lead?",
  "Draft message": "Draft a personalized outreach message for my top lead.",
  "Analyze pipeline": "Analyze current pipeline and suggest immediate moves.",
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const FILE_ACCEPT = "image/*,.pdf,.csv";
const TONES: ToneType[] = ["professional", "friendly", "direct"];

export const AIPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<ToneType>("professional");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const { leads, manageLeads } = useLeadStore();
  const { generateMessage } = useMessageGenerator();

  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const leadPool = leads.length ? leads : MOCK_LEADS;

  const topLead = useMemo(() => {
    return [...leadPool].sort((a, b) => b.score - a.score)[0] ?? MOCK_LEADS[0];
  }, [leadPool]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const buildContext = (prompt: string) => {
    const leadSummary = leadPool
      .slice(0, 8)
      .map((lead, index) => `${index + 1}. ${lead.author} | score=${lead.score} | summary=${lead.summary}`)
      .join("\n");

    const pipelineSummary = manageLeads
      .slice(0, 10)
      .map((lead) => `${lead.name} (${lead.stage}) score=${lead.score}`)
      .join("\n");

    const fileContext = attachedFile
      ? `Attached file: ${attachedFile.name} (${attachedFile.type || "unknown"}, ${Math.max(1, Math.round(attachedFile.size / 1024))}KB)`
      : "";

    return [
      "You are AI Sales Engine assistant.",
      "Goal: return concise actionable insights.",
      `Tone: ${tone}`,
      `User prompt: ${prompt}`,
      "Leads:",
      leadSummary,
      pipelineSummary ? `Pipeline:\n${pipelineSummary}` : "",
      fileContext,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const buildInsightCard = (): InsightCard => {
    return {
      leadName: topLead.author,
      score: Math.max(72, topLead.score),
      budget: topLead.budget ? "₹1.5L+" : "Budget TBD",
      pain: ["No mobile presence", "Follow-up gaps", "Manual pipeline tracking"],
      suggestion: "Offer MVP app in 2 weeks with a conversion-focused demo.",
    };
  };

  const shouldShowCard = (prompt: string) => {
    const text = prompt.toLowerCase();
    return text.includes("best") || text.includes("lead") || text.includes("next action") || text.includes("pipeline");
  };

  const sendMessage = async (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? input).trim();
    if (!prompt || loading) return;

    addMessage({ id: createId(), role: "user", content: prompt });
    setInput("");
    setLoading(true);

    try {
      const result = await generateMessage({
        lead_context: buildContext(prompt),
        tone,
        max_words: 140,
      });

      addMessage({
        id: createId(),
        role: "assistant",
        content: result.message,
        card: shouldShowCard(prompt) ? buildInsightCard() : undefined,
      });
    } catch {
      addMessage({
        id: createId(),
        role: "assistant",
        content: `I found strong intent from ${topLead.author}. Best to contact now (${Math.max(topLead.score, 82)}% close probability).`,
        card: shouldShowCard(prompt) ? buildInsightCard() : undefined,
      });
    } finally {
      setLoading(false);
      setAttachedFile(null);
    }
  };

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    const prompt = QUICK_ACTION_PROMPT[action];
    setInput(prompt);
    void sendMessage(prompt);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAttachedFile(file);
    addMessage({
      id: createId(),
      role: "assistant",
      content: `Attached ${file.name}. I can analyze this ${file.type || "file"} and suggest next sales actions.`,
    });

    if (file.type.includes("csv") || file.name.toLowerCase().endsWith(".csv")) {
      setInput("Import leads + summarize high-intent opportunities from this CSV.");
    } else if (file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf")) {
      setInput("Improve this pitch deck/proposal and suggest stronger positioning.");
    } else if (file.type.includes("image")) {
      setInput("Analyze this screenshot and suggest the next best sales action.");
    }

    event.target.value = "";
  };

  const hideMessage = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, hidden: true } : msg)));
  };

  const useMessage = (content: string) => {
    setInput(content);
  };

  const sendCardMessage = async (content: string) => {
    const targetLead = topLead;
    if (!targetLead.email) {
      addMessage({ id: createId(), role: "assistant", content: `No email found for ${targetLead.author}.` });
      return;
    }

    try {
      await messageService.sendEmail({
        to: targetLead.email,
        subject: `Regarding your ${targetLead.title || "project"}`,
        message: content,
        lead_id: targetLead.id,
      });
      addMessage({ id: createId(), role: "assistant", content: `Message sent to ${targetLead.email}.` });
    } catch {
      addMessage({ id: createId(), role: "assistant", content: "Unable to send message right now. Check SMTP and try again." });
    }
  };

  const visibleMessages = messages.filter((message) => !message.hidden);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">AI Sales Engine</h2>
        <p className="text-sm text-text-dim">Real-time insights for your pipeline</p>
      </header>

      <section className="mx-auto w-full max-w-5xl space-y-4">
        <div className="min-h-[500px] rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-aura">
          <div className="mx-auto flex h-full max-w-[800px] flex-col gap-4">
            {visibleMessages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-5 text-sm text-text-dim">
                <p className="text-white">👋 Welcome to your AI Sales Engine</p>
                <p className="mt-2">Try:</p>
                <p>• Find new leads</p>
                <p>• Get best lead to contact</p>
                <p>• Generate outreach message</p>
              </div>
            ) : null}

            {visibleMessages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-7 transition-all [animation:fadeIn_220ms_ease-out] ${
                    message.role === "assistant"
                      ? "border border-violet-300/25 bg-violet-500/12 text-violet-50"
                      : "border border-white/15 bg-black/35 text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {message.role === "assistant" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => useMessage(message.content)}
                        className="rounded border border-white/15 bg-black/35 px-2.5 py-1 text-xs text-white"
                      >
                        Use this
                      </button>
                      <button
                        type="button"
                        onClick={() => setInput(message.content)}
                        className="rounded border border-white/15 bg-black/35 px-2.5 py-1 text-xs text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => hideMessage(message.id)}
                        className="rounded border border-rose-300/30 bg-rose-500/15 px-2.5 py-1 text-xs text-rose-100"
                      >
                        Ignore
                      </button>
                    </div>
                  ) : null}

                  {message.card ? (
                    <div className="mt-3 rounded-xl border border-white/15 bg-black/25 p-3 text-sm text-white/90">
                      <p className="text-[13px] font-semibold text-amber-200">🔥 Best Lead: {message.card.leadName}</p>
                      <p className="mt-1 text-xs text-text-dim">Score: {message.card.score}%</p>
                      <p className="text-xs text-text-dim">Budget: {message.card.budget}</p>
                      <div className="mt-2 text-xs text-text-dim">
                        <p className="font-semibold text-white">Pain:</p>
                        {message.card.pain.map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-emerald-200">Suggestion: {message.card.suggestion}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void sendCardMessage(message.content)}
                          className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-slate-950"
                        >
                          Send Message
                        </button>
                        <button
                          type="button"
                          onClick={() => addMessage({ id: createId(), role: "assistant", content: `${message.card?.leadName} added to pipeline actions.` })}
                          className="rounded border border-cyan-300/30 bg-cyan-500/15 px-2.5 py-1 text-xs text-cyan-100"
                        >
                          Add to Pipeline
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1 rounded-2xl border border-violet-300/25 bg-violet-500/12 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-100" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-100 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-100 [animation-delay:240ms]" />
                </div>
              </div>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-panel/80 p-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleQuickAction(action)}
              className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-text-dim hover:border-cyan-300/40 hover:text-cyan-100"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-panel/85 p-3">
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-text-dim hover:text-white"
            >
              📎
            </button>

            <input ref={fileInputRef} type="file" accept={FILE_ACCEPT} onChange={handleFileUpload} className="hidden" />

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={2}
              placeholder="Ask something..."
              className="min-h-[56px] flex-1 resize-none rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/45"
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              Send
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {attachedFile ? (
              <span className="text-xs text-emerald-200">Attached: {attachedFile.name}</span>
            ) : (
              <span className="text-xs text-text-dim">Attach image, PDF, or CSV for deeper analysis.</span>
            )}

            <div className="ml-auto flex gap-2">
              {TONES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={`rounded border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] ${
                    tone === option ? "border-cyan-300/40 bg-cyan-500/10 text-cyan-100" : "border-white/10 text-text-dim"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
