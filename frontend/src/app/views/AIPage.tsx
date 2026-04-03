import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { MOCK_LEADS } from "../../features/leads/constants/mockLeads";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { messageService } from "../../features/leads/services/messageService";
import { useLeadStore } from "../../store/useLeadStore";
import type { ToneType } from "../../features/common/types/ui";
import { PageBackground } from "../../components/ui/PageBackground";
import bgChatBot from "../../assets/bg-images/chat-bot.svg";

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

type ChatSession = {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  messages: ChatMessage[];
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
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { leads } = useLeadStore();
  const { leads: manageLeads } = useCentralizedLeads();
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

  const createSessionFromMessages = (source: ChatMessage[]): ChatSession | null => {
    if (source.length === 0) return null;

    const firstUserPrompt = source.find((message) => message.role === "user")?.content || "Untitled conversation";
    const preview = source[source.length - 1]?.content || firstUserPrompt;

    return {
      id: createId(),
      title: firstUserPrompt.slice(0, 40),
      preview: preview.slice(0, 72),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      messages: source,
    };
  };

  const saveCurrentChat = () => {
    const session = createSessionFromMessages(messages);
    if (!session) return;

    setChatHistory((prev) => [session, ...prev].slice(0, 10));
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const session = createSessionFromMessages(messages);
      if (session) {
        setChatHistory((prev) => [session, ...prev].slice(0, 10));
      }
    }

    setMessages([]);
    setInput("");
    setAttachedFile(null);
    setHistoryOpen(false);
  };

  const restoreChat = (session: ChatSession) => {
    setMessages(session.messages);
    setInput("");
    setAttachedFile(null);
    setHistoryOpen(false);
  };

  const visibleMessages = messages.filter((message) => !message.hidden);

  return (
    <div>
      <PageBackground image={bgChatBot} tint="rgba(6, 182, 212, 0.80)" />
      <div className="h-[calc(100vh-100px)] overflow-auto relative flex flex-col space-y-4 p-6">
      <header className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="page-title">AI Sales Engine</h2>
          <p className="page-subtitle">Real-time insights for your pipeline</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveCurrentChat}
            disabled={messages.length === 0}
            className="glass-btn h-9 w-9 items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-50"
            title="Save current chat"
            aria-label="Save current chat"
          >
            💾
          </button>
          <button
            type="button"
            onClick={startNewChat}
            className="glass-btn h-9 w-9 items-center justify-center p-0"
            title="Start new chat"
            aria-label="Start new chat"
          >
            ➕
          </button>
          <button
            type="button"
            onClick={() => setHistoryOpen((open) => !open)}
            className="glass-btn h-9 w-9 items-center justify-center p-0"
            title="Chat history"
            aria-label="Toggle chat history"
          >
            🕘
          </button>
        </div>

        {historyOpen ? (
          <div className="absolute right-0 top-12 z-20 w-full max-w-sm glass-card p-3 md:w-96">
            <p className="text-xs font-semibold uppercase tracking-wider text-content-secondary">Recent Chats</p>
            <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
              {chatHistory.length > 0 ? (
                chatHistory.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => restoreChat(session)}
                    className="w-full rounded-xl border border-accent/10 bg-surface-secondary/50 px-3 py-2 text-left transition hover:border-accent/30 hover:bg-surface-secondary/70"
                  >
                    <p className="text-sm font-medium text-content">{session.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-content-secondary">{session.preview}</p>
                    <p className="mt-1 text-[11px] text-accent">{session.createdAt}</p>
                  </button>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-accent/20 bg-surface-secondary/30 px-3 py-4 text-xs text-content-secondary">
                  No saved chats yet. Use the 💾 button to save your current conversation.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col gap-4">
        <div className="glass-card flex min-h-0 flex-1 p-4 md:p-5">
          <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {visibleMessages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-accent/20 bg-surface-secondary/30 p-5 text-sm text-content-secondary">
                  <p className="text-base font-medium text-content">👋 Welcome to your AI Sales Engine</p>
                  <p className="mt-2">Try one of the quick actions below:</p>
                  <p>• Find new leads</p>
                  <p>• Get best lead to contact</p>
                  <p>• Generate outreach message</p>
                </div>
              ) : null}

              {visibleMessages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-[15px] leading-7 transition-all animate-fadeIn ${
                      message.role === "assistant"
                        ? "border border-accent/25 bg-accent-soft text-content"
                        : "border border-accent/15 bg-surface-secondary/70 text-content"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.role === "assistant" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => useMessage(message.content)}
                          className="glass-btn px-2.5 py-1 text-xs"
                        >
                          Use this
                        </button>
                        <button
                          type="button"
                          onClick={() => setInput(message.content)}
                          className="glass-btn px-2.5 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => hideMessage(message.id)}
                          className="rounded border border-danger/30 bg-danger-soft px-2.5 py-1 text-xs text-danger transition hover:bg-danger/20"
                        >
                          Ignore
                        </button>
                      </div>
                    ) : null}

                    {message.card ? (
                      <div className="mt-3 rounded-xl border border-accent/15 bg-surface-secondary/50 p-3 text-sm">
                        <p className="text-[13px] font-semibold text-warning">🔥 Best Lead: {message.card.leadName}</p>
                        <p className="mt-1 text-xs text-content-secondary">Score: {message.card.score}%</p>
                        <p className="text-xs text-content-secondary">Budget: {message.card.budget}</p>
                        <div className="mt-2 text-xs text-content-secondary">
                          <p className="font-semibold text-content">Pain:</p>
                          {message.card.pain.map((item) => (
                            <p key={item}>- {item}</p>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-success">Suggestion: {message.card.suggestion}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void sendCardMessage(message.content)}
                            className="accent-btn px-2.5 py-1 text-xs"
                          >
                            Send Message
                          </button>
                          <button
                            type="button"
                            onClick={() => addMessage({ id: createId(), role: "assistant", content: `${message.card?.leadName} added to pipeline actions.` })}
                            className="glass-btn px-2.5 py-1 text-xs"
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
                  <div className="inline-flex items-center gap-1 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:240ms]" />
                  </div>
                </div>
              ) : null}

              <div ref={endRef} />
            </div>
          </div>
        </div>

        <div className="glass-card grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleQuickAction(action)}
              className="glass-btn rounded-full px-3 py-1.5 text-xs text-content-secondary hover:text-content"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="glass-card p-3">
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="glass-btn px-3 py-2 text-sm"
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
              className="glass-input min-h-[52px] flex-1 resize-none"
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="accent-btn px-4 py-2 text-sm disabled:opacity-60"
            >
              Send
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {attachedFile ? (
              <span className="text-xs text-success">Attached: {attachedFile.name}</span>
            ) : (
              <span className="text-xs text-content-tertiary">Attach image, PDF, or CSV for deeper analysis.</span>
            )}

            <div className="ml-auto flex gap-2">
              {TONES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={`rounded border px-2.5 py-1 text-[11px] uppercase tracking-wider ${
                    tone === option ? "border-info/40 bg-info-soft text-info" : "border-accent/10 text-content-tertiary hover:border-accent/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};
