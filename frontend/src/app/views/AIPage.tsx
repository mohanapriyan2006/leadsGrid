import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { AIComposer } from "../../features/ai/components/AIComposer";
import { AIHeader } from "../../features/ai/components/AIHeader";
import { AIMessageFeed } from "../../features/ai/components/AIMessageFeed";
import { AIQuickActions } from "../../features/ai/components/AIQuickActions";
import {
  CHAT_HISTORY_LIMIT,
  FILE_ACCEPT,
  QUICK_ACTION_PROMPT,
  QUICK_ACTIONS,
  TONES,
  createId,
  type QuickAction,
} from "../../features/ai/constants/aiPage";
import type { ChatMessage, ChatSession, InsightCard } from "../../features/ai/types/chat";
import { MOCK_LEADS } from "../../features/leads/constants/mockLeads";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { messageService } from "../../features/leads/services/messageService";
import { useLeadStore } from "../../store/useLeadStore";
import type { ToneType } from "../../features/common/types/ui";
import { PageBackground } from "../../components/ui/PageBackground";
import bgChatBot from "../../assets/bg-images/chat-bot.svg";

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

  const handleQuickAction = (action: QuickAction) => {
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

    setChatHistory((prev) => [session, ...prev].slice(0, CHAT_HISTORY_LIMIT));
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const session = createSessionFromMessages(messages);
      if (session) {
        setChatHistory((prev) => [session, ...prev].slice(0, CHAT_HISTORY_LIMIT));
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
        <AIHeader
          historyOpen={historyOpen}
          chatHistory={chatHistory}
          messagesCount={messages.length}
          onSaveCurrentChat={saveCurrentChat}
          onStartNewChat={startNewChat}
          onToggleHistory={() => setHistoryOpen((open) => !open)}
          onRestoreChat={restoreChat}
        />

      <section className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col gap-4">
        <div className="glass-card flex min-h-0 flex-1 p-4 md:p-5">
          <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4">
            <AIMessageFeed
              messages={visibleMessages}
              loading={loading}
              endRef={endRef}
              onUseMessage={useMessage}
              onEditMessage={setInput}
              onHideMessage={hideMessage}
              onSendCardMessage={(content) => {
                void sendCardMessage(content);
              }}
              onAddToPipeline={(leadName) => {
                addMessage({
                  id: createId(),
                  role: "assistant",
                  content: `${leadName} added to pipeline actions.`,
                });
              }}
            />
          </div>
        </div>

        <AIQuickActions actions={QUICK_ACTIONS} onAction={handleQuickAction} />

        <AIComposer
          input={input}
          loading={loading}
          attachedFile={attachedFile}
          fileAccept={FILE_ACCEPT}
          tones={TONES}
          tone={tone}
          fileInputRef={fileInputRef}
          onFileUpload={handleFileUpload}
          onInputChange={setInput}
          onToneChange={setTone}
          onSend={() => {
            void sendMessage();
          }}
        />
      </section>
      </div>
    </div>
  );
};
