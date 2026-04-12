import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AIComposer } from "../../features/ai/components/AIComposer";
import { AttachLeadsModal } from "../../features/ai/components/AttachLeadsModal";
import { AIHeader } from "../../features/ai/components/AIHeader";
import { AIMessageFeed } from "../../features/ai/components/AIMessageFeed";
import {
  CHAT_HISTORY_LIMIT,
  TONES,
  createId,
} from "../../features/ai/constants/aiPage";
import type { ChatMessage, ChatSession } from "../../features/ai/types/chat";
import { MOCK_LEADS } from "../../features/leads/constants/mockLeads";
import { useCentralizedLeads } from "../../features/leads/hooks/useCentralizedLeads";
import { useMessageGenerator } from "../../features/leads/hooks/useMessageGenerator";
import { messageService } from "../../features/leads/services/messageService";
import type { Lead } from "../../features/leads/types/lead";
import { useLeadStore } from "../../store/useLeadStore";
import type { ToneType } from "../../features/common/types/ui";
import { FullscreenToggleButton } from "../../components/ui/FullscreenToggleButton";
import { PageBackground } from "../../components/ui/PageBackground";
import { ResponsivePageLayout } from "../../components/ui/ResponsivePageLayout";
import bgChatBot from "../../assets/bg-images/chat-bot.svg";
import { useMode } from "../../features/ai/hooks/useMode";
import { useSuggestions } from "../../features/ai/hooks/useSuggestions";
import { useAgentExecution } from "../../features/ai/hooks/useAgentExecution";
import type { AgentStep } from "../../features/ai/types/agent";
import type { AgentActionResult } from "../../features/ai/services/agentApiService";
import { buildContextSummary, buildStructuredAIContext } from "../../features/ai/services/contextBuilder";
import { conversationMemoryService } from "../../features/ai/services/conversationMemoryService";
import { useAuth } from "../../features/auth/AuthContext";
import { useSettingsState } from "../../features/settings/hooks/useSettingsState";

export const AIPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<ToneType>("professional");
  const [attachedLeadIds, setAttachedLeadIds] = useState<string[]>([]);
  const [attachLeadsOpen, setAttachLeadsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lastAgentPrompt, setLastAgentPrompt] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  const { settings } = useSettingsState(user?.email);

  const { leads } = useLeadStore();
  const { leads: manageLeads } = useCentralizedLeads();
  const { generateMessage } = useMessageGenerator();

  const {
    mode,
    toggleMode,
    switchToAgent,
    aiStatus,
    setAIStatus,
    activeContext,
    autoApproveLowRisk,
    setAutoApproveLowRisk,
  } = useMode();

  const endRef = useRef<HTMLDivElement | null>(null);
  const leadPool = leads.length ? leads : MOCK_LEADS;

  const aiWordLimit = useMemo(() => {
    if (settings.ai.messageStyle === "short") return 90;
    if (settings.ai.messageStyle === "detailed") return 220;
    return 140;
  }, [settings.ai.messageStyle]);

  const personalizationInstruction = useMemo(() => {
    if (settings.ai.personalization === "low") {
      return "Keep personalization minimal and avoid speculative details.";
    }
    if (settings.ai.personalization === "high") {
      return "Use rich personalization from available lead context and tailor recommendations specifically.";
    }
    return "Use balanced personalization grounded in available lead context.";
  }, [settings.ai.personalization]);

  const getLeadChipTitle = useCallback((lead: Lead) => {
    const base = (lead.title || lead.author || lead.summary || "Untitled lead").trim();
    if (base.length <= 30) return base;
    return `${base.slice(0, 27)}...`;
  }, []);

  const topLead = useMemo(() => {
    return [...leadPool].sort((a, b) => b.score - a.score)[0] ?? MOCK_LEADS[0];
  }, [leadPool]);

  const attachedLeads = useMemo(() => {
    if (attachedLeadIds.length === 0) return [];
    const selected = new Set(attachedLeadIds);
    return manageLeads
      .filter((lead) => selected.has(lead.id))
      .map((lead) => ({
        id: lead.id,
        author: lead.name,
        company: lead.company,
        title: lead.company,
        summary: lead.notes || `Lead from ${lead.company}`,
        content: lead.notes || `Lead from ${lead.company}`,
        score: lead.score,
        email: lead.email || undefined,
        phone: lead.phone || undefined,
        website: lead.website_url || undefined,
        address: lead.address || undefined,
        source: "search" as const,
        created_at: lead.created_at,
        tags: lead.notes ? [lead.source] : ["saved"],
        intent_label: "prospect",
      }));
  }, [attachedLeadIds, manageLeads]);

  const attachedLeadChips = useMemo(
    () => attachedLeads.map((lead) => ({ id: lead.id, title: getLeadChipTitle(lead) })),
    [attachedLeads, getLeadChipTitle],
  );

  const { typingSuggestions, smartChips, setInputValue } = useSuggestions({
    mode,
    leadCount: leadPool.length,
    manageLeadCount: manageLeads.length,
    topLeadName: topLead.author,
  });

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const shouldOfferAgent = useCallback((prompt: string, response: string, providerFlag?: boolean) => {
    if (providerFlag) return true;
    const combined = `${prompt} ${response}`.toLowerCase();
    const executionHints = ["find leads", "send", "execute", "schedule", "update crm", "automation", "bulk"];
    return executionHints.some((hint) => combined.includes(hint));
  }, []);

  const agentCallbacks = useMemo(
    () => ({
      onStepStart: (_step: AgentStep, _index: number) => {},
      onStepComplete: (_step: AgentStep, _index: number, _result: AgentActionResult) => {},
      onStepFail: (step: AgentStep, _index: number, error: string) => {
        addMessage({
          id: createId(),
          role: "agent",
          content: `❌ ${step.label} failed: ${error}`,
        });
      },
      onPlanComplete: () => {
        addMessage({
          id: createId(),
          role: "agent",
          content: "🎉 All tasks completed. Results are saved to your CRM.",
        });
      },
      onStatusChange: setAIStatus,
    }),
    [addMessage, setAIStatus],
  );

  const {
    plan: agentPlan,
    executionState,
    createPlan,
    approvePlan,
    editPlanStep,
    removeStep,
    executePlan,
    continueExecution,
    skipCurrentStep,
    abortExecution,
    resetPlan,
  } = useAgentExecution(agentCallbacks);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, agentPlan, executionState]);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      const storedSessions = await conversationMemoryService.listSessions(CHAT_HISTORY_LIMIT);
      if (!active) return;
      setChatHistory(storedSessions);
    };

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setInputValue(input);
  }, [input, setInputValue]);

  useEffect(() => {
    setTone(settings.messaging.defaultTone);
  }, [settings.messaging.defaultTone]);

  const buildAskPayload = (prompt: string) => {
    const structuredContext = buildStructuredAIContext({
      prompt,
      tone,
      leadPool,
      manageLeads,
      attachedLeads,
      messages,
      chatHistory,
      attachedLeadIds,
    });

    return {
      prompt,
      lead_context: buildContextSummary(structuredContext),
      structured_context: structuredContext,
    };
  };

  const sendAskMessage = async (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? input).trim();
    if (!prompt || loading) return;

    addMessage({ id: createId(), role: "user", content: prompt });
    setInput("");
    setLoading(true);
    setAIStatus("thinking");

    try {
      const askPayload = buildAskPayload(prompt);
      const enrichedContext = [
        askPayload.lead_context,
        personalizationInstruction,
        settings.ai.enableEvaluator
          ? "Self-evaluate the final answer briefly for clarity and actionability before returning it."
          : "Skip evaluator/self-critique steps and return the direct answer.",
      ].join("\n");

      const result = await generateMessage({
        ...askPayload,
        lead_context: enrichedContext,
        tone,
        max_words: aiWordLimit,
      });

      addMessage({
        id: createId(),
        role: "assistant",
        content: result.message,
        mode: "ask",
        offerAgent: shouldOfferAgent(prompt, result.message, result.requires_agent),
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown AI error";
      addMessage({
        id: createId(),
        role: "assistant",
        content: `AI request failed: ${reason}`,
        mode: "ask",
        offerAgent: false,
      });
    } finally {
      setLoading(false);
      setAIStatus("idle");
    }
  };

  const sendAgentMessage = (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? input).trim();
    if (!prompt || loading) return;

    addMessage({ id: createId(), role: "user", content: prompt });
    setInput("");
    setLastAgentPrompt(prompt);
    setAIStatus("thinking");

    resetPlan();

    addMessage({
      id: createId(),
      role: "agent",
      content: "🤖 Analyzing your request and building an execution plan...",
      mode: "agent",
    });

    setTimeout(() => {
      void createPlan(prompt, leadPool)
        .catch(() => {
          addMessage({
            id: createId(),
            role: "agent",
            content: "⚠️ Unable to build execution plan right now. Please retry.",
          });
        })
        .finally(() => {
          setAIStatus("idle");
        });
    }, 800);
  };

  const sendMessage = async (overridePrompt?: string) => {
    if (mode === "ask") {
      await sendAskMessage(overridePrompt);
    } else {
      sendAgentMessage(overridePrompt);
    }
  };

  const handleApproveAll = () => {
    if (!agentPlan) return;
    approvePlan("all");

    addMessage({
      id: createId(),
      role: "agent",
      content: "✅ Plan approved. Starting execution...",
    });

    const approvedPlan = { ...agentPlan, approved: true, approvalMode: "all" as const };
    void executePlan(approvedPlan, leadPool, lastAgentPrompt, tone, autoApproveLowRisk);
  };

  const handleApproveStepByStep = () => {
    if (!agentPlan) return;
    approvePlan("step_by_step");

    addMessage({
      id: createId(),
      role: "agent",
      content: "✅ Step-by-step mode. I'll ask permission for each action.",
    });

    const approvedPlan = { ...agentPlan, approved: true, approvalMode: "step_by_step" as const };
    void executePlan(approvedPlan, leadPool, lastAgentPrompt, tone, autoApproveLowRisk);
  };

  const handleContinueExecution = () => {
    void continueExecution(leadPool, lastAgentPrompt, tone, autoApproveLowRisk);
  };

  const handleSkipExecutionStep = () => {
    void skipCurrentStep(leadPool, lastAgentPrompt, tone, autoApproveLowRisk);
  };

  const handleAbortExecution = () => {
    abortExecution();
    addMessage({
      id: createId(),
      role: "agent",
      content: "⛔ Execution aborted by user.",
    });
  };

  const handleConvertToAgent = (content: string) => {
    switchToAgent();
    setInput(content);
    setTimeout(() => {
      sendAgentMessage(content);
    }, 100);
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    void sendMessage(prompt);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleAttachLeads = (leadIds: string[]) => {
    setAttachedLeadIds(leadIds);
  };

  const handleRemoveAttachedLead = (leadId: string) => {
    setAttachedLeadIds((prev) => prev.filter((id) => id !== leadId));
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

  const createSessionFromMessages = (source: ChatMessage[], sessionId?: string): ChatSession | null => {
    if (source.length === 0) return null;

    const firstUserPrompt = source.find((message) => message.role === "user")?.content || "Untitled conversation";
    const preview = source[source.length - 1]?.content || firstUserPrompt;

    return {
      id: sessionId ?? createId(),
      title: firstUserPrompt.slice(0, 40),
      preview: preview.slice(0, 72),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      messages: source,
    };
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const sessionId = activeSessionId ?? createId();
    if (!activeSessionId) {
      setActiveSessionId(sessionId);
    }

    const session = createSessionFromMessages(messages, sessionId);
    if (!session) return;

    setChatHistory((prev) => {
      const remaining = prev.filter((entry) => entry.id !== session.id);
      return [session, ...remaining].slice(0, CHAT_HISTORY_LIMIT);
    });

    void conversationMemoryService.saveSession(session);
  }, [messages, activeSessionId]);

  const saveCurrentChat = () => {
    const session = createSessionFromMessages(messages, activeSessionId ?? undefined);
    if (!session) return;

    if (!activeSessionId) {
      setActiveSessionId(session.id);
    }

    setChatHistory((prev) => [session, ...prev.filter((entry) => entry.id !== session.id)].slice(0, CHAT_HISTORY_LIMIT));
    void conversationMemoryService.saveSession(session);
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const session = createSessionFromMessages(messages, activeSessionId ?? undefined);
      if (session) {
        setChatHistory((prev) => [session, ...prev.filter((entry) => entry.id !== session.id)].slice(0, CHAT_HISTORY_LIMIT));
        void conversationMemoryService.saveSession(session);
      }
    }

    setMessages([]);
    setInput("");
    setAttachedLeadIds([]);
    setHistoryOpen(false);
    setActiveSessionId(null);
    resetPlan();
  };

  const restoreChat = (session: ChatSession) => {
    setMessages(session.messages);
    setInput("");
    setAttachedLeadIds([]);
    setHistoryOpen(false);
    setActiveSessionId(session.id);
  };

  const visibleMessages = messages.filter((message) => !message.hidden);

  return (
    <>
		<PageBackground image={bgChatBot} tint={mode == "agent" ? "rgba(6, 182, 212, 0.28)" : "rgba(99, 102, 241, 0.25)"} opacity={0.40} />
    <ResponsivePageLayout      
      contentClassName="flex flex-col overflow-hidden !p-4 md:!p-6"
    >
        <AIHeader
          historyOpen={historyOpen}
          chatHistory={chatHistory}
          messagesCount={messages.length}
          mode={mode}
          aiStatus={aiStatus}
          activeContext={activeContext}
          utilityControl={<FullscreenToggleButton />}
          onSaveCurrentChat={saveCurrentChat}
          onStartNewChat={startNewChat}
          onToggleHistory={() => setHistoryOpen((open) => !open)}
          onRestoreChat={restoreChat}
          onToggleMode={toggleMode}
        />

        <section className="mx-auto mt-4 flex w-full max-w-5xl flex-1 min-h-0 flex-col gap-3">
          <div className="ai-chat-panel flex min-h-0 flex-1 flex-col rounded-2xl border border-accent/[0.12] p-4 md:p-5">
            <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
              <AIMessageFeed
                messages={visibleMessages}
                loading={loading}
                mode={mode}
                endRef={endRef}
                suggestions={smartChips}
                agentPlan={agentPlan}
                executionState={executionState}
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
                onSuggestionClick={handleSuggestionClick}
                onConvertToAgent={handleConvertToAgent}
                onApproveAll={handleApproveAll}
                onApproveStepByStep={handleApproveStepByStep}
                onEditStep={editPlanStep}
                onRemoveStep={removeStep}
                onContinueExecution={handleContinueExecution}
                onSkipExecution={handleSkipExecutionStep}
                onAbortExecution={handleAbortExecution}
                autoApproveLowRisk={autoApproveLowRisk}
                onToggleAutoApprove={() => setAutoApproveLowRisk((value) => !value)}
              />
            </div>
          </div>

          <AIComposer
            input={input}
            loading={loading}
            attachedLeads={attachedLeadChips}
            tones={TONES}
            tone={tone}
            mode={mode}
            typingSuggestions={typingSuggestions}
            onOpenAttachLeads={() => setAttachLeadsOpen(true)}
            onRemoveAttachedLead={handleRemoveAttachedLead}
            onInputChange={setInput}
            onToneChange={setTone}
            onSend={() => {
              void sendMessage();
            }}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </section>

        <AttachLeadsModal
          open={attachLeadsOpen}
          leads={manageLeads.map((lead) => ({
            id: lead.id,
            author: lead.name,
            company: lead.company,
            title: lead.company,
            summary: lead.notes || `Lead from ${lead.company}`,
            content: lead.notes || `Lead from ${lead.company}`,
            score: lead.score,
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            website: lead.website_url || undefined,
            address: lead.address || undefined,
            source: "search" as const,
            created_at: lead.created_at,
            tags: lead.notes ? [lead.source] : ["saved"],
            intent_label: "prospect",
          }))}
          selectedLeadIds={attachedLeadIds}
          onClose={() => setAttachLeadsOpen(false)}
          onApply={handleAttachLeads}
        />
    </ResponsivePageLayout>
    </>
  );
};
