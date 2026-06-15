import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AIComposer } from "../../features/ai/components/AIComposer";
import { AttachLeadsModal } from "../../features/ai/components/AttachLeadsModal";
import { AIHeader } from "../../features/ai/components/AIHeader";
import { AIMessageFeed } from "../../features/ai/components/AIMessageFeed";
import { DeleteConfirmModal } from "../../features/ai/components/DeleteConfirmModal";
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
import { leadService } from "../../features/leads/services/leadService";
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
import { useAgentConversation } from "../../features/ai/hooks/useAgentConversation";
import type { AgentStep } from "../../features/ai/types/agent";
import type { AgentActionResult } from "../../features/ai/services/agentApiService";
import { buildContextSummary, buildStructuredAIContext } from "../../features/ai/services/contextBuilder";
import { conversationMemoryService } from "../../features/ai/services/conversationMemoryService";
import { useAuth } from "../../features/auth/AuthContext";
import { useSettingsState } from "../../features/settings/hooks/useSettingsState";
import { usageTracker } from "../../features/billing/services/usageTracker";
import { showLimitModal } from "../../features/billing/hooks/useLimitModal";

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
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [useConversationalAgent, setUseConversationalAgent] = useState(true);
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

  // Use real managed leads from Firestore as the primary lead pool.
  // Fallback to discovery leads, then mock data only if both are empty.
  const managedLeadPool = useMemo<Lead[]>(
    () =>
      manageLeads.map((lead) => ({
        id: lead.id,
        source: lead.source === "website" ? "search" : (lead.source as Lead["source"]),
        author: lead.name,
        company: lead.company,
        title: lead.company,
        content: lead.notes || `Lead from ${lead.company}`,
        summary: lead.notes || `Lead from ${lead.company}`,
        score: lead.score,
        tags: lead.notes ? [lead.source] : ["saved"],
        intent_label: "prospect",
        created_at: lead.created_at,
        email: lead.email || undefined,
        phone: lead.phone || undefined,
        website: lead.website_url || undefined,
        address: lead.address || undefined,
        pain_point: lead.ai_analysis?.pain_points?.[0],
        category:
          lead.category === "hiring" ||
            lead.category === "problem" ||
            lead.category === "switching" ||
            lead.category === "learning" ||
            lead.category === "discussion"
            ? lead.category
            : undefined,
        urgency: lead.urgency === "high",
        budget: lead.budget_estimate > 0,
      })),
    [manageLeads]
  );

  const leadPool = managedLeadPool.length ? managedLeadPool : leads.length ? leads : MOCK_LEADS;

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
      onStepStart: (_step: AgentStep, _index: number) => { },
      onStepComplete: (_step: AgentStep, _index: number, _result: AgentActionResult) => { },
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

  const {
    messages: agentConversationMessages,
    loading: agentConversationLoading,
    sendMessage: sendAgentConversationMessage,
    confirmAction: confirmAgentAction,
    reset: resetAgentConversation,
  } = useAgentConversation(attachedLeadIds);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, agentPlan, executionState, agentConversationMessages, agentConversationLoading]);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

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

    const limitCheck = await usageTracker.checkLimit("ask_ai_per_month", 1);
    if (!limitCheck.allowed) {
      showLimitModal({ action: "ask_ai_per_month", current: limitCheck.current, limit: limitCheck.limit });
      return;
    }

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
      await usageTracker.incrementUsage("ask_ai_per_month", 1);
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

  const sendAgentMessage = async (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? input).trim();
    if (!prompt || loading || agentConversationLoading) return;

    if (useConversationalAgent) {
      // Conversational agent flow
      await sendAgentConversationMessage(prompt);
      setInput("");
      return;
    }

    // Legacy plan-based flow
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
    if (messages.length === 0 || !user) return;

    const sessionId = activeSessionId ?? createId();
    if (!activeSessionId) {
      setActiveSessionId(sessionId);
    }

    setChatHistory((prev) => {
      const existingSession = prev.find((s) => s.id === sessionId);

      let session = createSessionFromMessages(messages, sessionId);
      if (!session) return prev;

      if (existingSession) {
        session = { ...session, title: existingSession.title };
      }

      const remaining = prev.filter((entry) => entry.id !== session!.id);
      void conversationMemoryService.saveSession(session);

      return [session!, ...remaining].slice(0, CHAT_HISTORY_LIMIT);
    });
  }, [messages, activeSessionId, user]);

  const saveCurrentChat = () => {
    const session = createSessionFromMessages(messages, activeSessionId ?? undefined);
    if (!session) return;

    if (!activeSessionId) {
      setActiveSessionId(session.id);
    }

    setChatHistory((prev) => [session, ...prev.filter((entry) => entry.id !== session.id)].slice(0, CHAT_HISTORY_LIMIT));
    void conversationMemoryService.saveSession(session, { immediate: true });
  };

  const handleAgentCardAction = useCallback(
    async (action: string, payload?: Record<string, unknown>) => {
      if (action === "cancel") {
        await confirmAgentAction("cancel");
        return;
      }

      if (action === "navigate_discovery") {
        window.location.href = "/leads-discovery";
        return;
      }

      if (action === "navigate_lead") {
        const leadId = payload?.lead_id as string;
        if (leadId) window.location.href = `/leads/manage?lead=${leadId}`;
        return;
      }

      if (action === "save_lead") {
        const lead = payload?.lead as Record<string, unknown>;
        if (lead) {
          try {
            const mapped: Lead = {
              id: (lead.id as string) || createId(),
              source: (lead.source as Lead["source"]) || "search",
              author: (lead.name as string) || "",
              company: (lead.company as string) || "",
              title: (lead.company as string) || "",
              content: (lead.notes as string) || "",
              summary: (lead.notes as string) || "",
              score: (lead.score as number) || 60,
              tags: [],
              intent_label: "prospect",
              created_at: (lead.created_at as string) || new Date().toISOString(),
            };
            await leadService.saveDiscoveryLeadAsManageLead(mapped);
            addMessage({
              id: createId(),
              role: "agent",
              content: `✅ Saved "${String(lead.name || "Lead")}" to Manage Leads.`,
            });
          } catch (err) {
            addMessage({
              id: createId(),
              role: "agent",
              content: `❌ Failed to save lead: ${err instanceof Error ? err.message : "Unknown error"}`,
            });
          }
        }
        return;
      }

      if (action === "save_all_leads") {
        const leads = payload?.leads as Array<Record<string, unknown>>;
        if (leads) {
          let saved = 0;
          for (const lead of leads) {
            try {
              const mapped: Lead = {
                id: (lead.id as string) || createId(),
                source: (lead.source as Lead["source"]) || "search",
                author: (lead.name as string) || "",
                company: (lead.company as string) || "",
                title: (lead.company as string) || "",
                content: (lead.notes as string) || "",
                summary: (lead.notes as string) || "",
                score: (lead.score as number) || 60,
                tags: [],
                intent_label: "prospect",
                created_at: (lead.created_at as string) || new Date().toISOString(),
              };
              await leadService.saveDiscoveryLeadAsManageLead(mapped);
              saved++;
            } catch {
              // skip failed saves
            }
          }
          addMessage({
            id: createId(),
            role: "agent",
            content: `✅ Saved ${saved}/${leads.length} lead(s) to Manage Leads.`,
          });
        }
        return;
      }

      if (action === "edit_lead") {
        const leadId = payload?.lead_id as string;
        window.location.href = `/leads/manage?lead=${leadId}`;
        return;
      }

      if (action === "delete_lead") {
        const leadId = payload?.lead_id as string;
        const leadName = payload?.lead_name as string;
        addMessage({
          id: createId(),
          role: "agent",
          content: "",
          agentCard: {
            type: "confirmation",
            title: leadName ? `Delete ${leadName}?` : "Delete Lead?",
            description: "This lead will be moved to the Recycle Bin.",
            data: { lead_id: leadId, operation: "delete", lead_name: leadName },
            actions: [
              { label: "Delete", action: "confirm_delete_lead", payload: { lead_id: leadId }, style: "danger" },
              { label: "Cancel", action: "cancel", style: "secondary" },
            ],
            requires_confirmation: true,
          },
        });
        return;
      }

      if (action === "confirm_delete_lead") {
        const leadId = payload?.lead_id as string;
        try {
          await leadService.softDeleteManageLead(leadId);
          addMessage({ id: createId(), role: "agent", content: "✅ Lead moved to Recycle Bin." });
        } catch (err) {
          addMessage({ id: createId(), role: "agent", content: `❌ Delete failed: ${err instanceof Error ? err.message : "Unknown error"}` });
        }
        return;
      }

      if (action === "confirm_create_lead") {
        const fields = payload?.fields as Record<string, string> || {};
        const values = payload?.values as Record<string, string> || {};
        const merged = { ...fields, ...values };
        try {
          await leadService.createManageLead({
            name: merged.name || "New Lead",
            company: merged.company || "",
            email: merged.email || undefined,
            phone: merged.phone || undefined,
            stage: "NEW",
            notes: merged.industry ? `Industry: ${merged.industry}` : null,
          });
          addMessage({ id: createId(), role: "agent", content: `✅ Created lead "${merged.name || "New Lead"}".` });
        } catch (err) {
          addMessage({ id: createId(), role: "agent", content: `❌ Create failed: ${err instanceof Error ? err.message : "Unknown error"}` });
        }
        return;
      }

      if (action === "confirm_update_lead") {
        const leadId = payload?.lead_id as string;
        const fields = payload?.fields as Record<string, unknown>;
        try {
          await leadService.updateManageLead(leadId, fields || {});
          addMessage({ id: createId(), role: "agent", content: "✅ Lead updated successfully." });
        } catch (err) {
          addMessage({ id: createId(), role: "agent", content: `❌ Update failed: ${err instanceof Error ? err.message : "Unknown error"}` });
        }
        return;
      }

      if (action === "confirm_send_message") {
        const leadIds = payload?.lead_ids as string[];
        const content = payload?.content as string;
        if (leadIds && content) {
          try {
            for (const leadId of leadIds) {
              const lead = manageLeads.find((l) => l.id === leadId);
              if (lead?.email) {
                await messageService.sendEmail({
                  to: lead.email,
                  subject: `Regarding your ${lead.company || "business"}`,
                  message: content,
                  lead_id: leadId,
                });
              }
            }
            addMessage({ id: createId(), role: "agent", content: `✅ Message sent to ${leadIds.length} lead(s).` });
          } catch (err) {
            addMessage({ id: createId(), role: "agent", content: `❌ Send failed: ${err instanceof Error ? err.message : "Unknown error"}` });
          }
        }
        return;
      }

      if (action === "confirm_restore_lead") {
        const leadId = payload?.lead_id as string;
        try {
          await leadService.restoreManageLead(leadId);
          addMessage({ id: createId(), role: "agent", content: "✅ Lead restored successfully." });
        } catch (err) {
          addMessage({ id: createId(), role: "agent", content: `❌ Restore failed: ${err instanceof Error ? err.message : "Unknown error"}` });
        }
        return;
      }

      if (action === "confirm_permanent_delete") {
        const leadId = payload?.lead_id as string;
        try {
          await leadService.deleteManageLeadForever(leadId);
          addMessage({ id: createId(), role: "agent", content: "🗑️ Lead permanently deleted." });
        } catch (err) {
          addMessage({ id: createId(), role: "agent", content: `❌ Delete failed: ${err instanceof Error ? err.message : "Unknown error"}` });
        }
        return;
      }

      if (action === "send_message") {
        const draft = payload?.draft as string;
        const leadIds = payload?.lead_ids as string[];
        if (draft && leadIds) {
          addMessage({
            id: createId(),
            role: "agent",
            content: "",
            agentCard: {
              type: "confirmation",
              title: "Send Message?",
              description: `This message will be sent to ${leadIds.length} lead(s).`,
              data: { lead_ids: leadIds, content: draft, operation: "send" },
              actions: [
                { label: "Send", action: "confirm_send_message", payload: { lead_ids: leadIds, content: draft }, style: "primary" },
                { label: "Cancel", action: "cancel", style: "secondary" },
              ],
              requires_confirmation: true,
            },
          });
        }
        return;
      }

      if (action === "regenerate_message") {
        const leadIds = payload?.lead_ids as string[];
        const tone = payload?.tone as string;
        if (leadIds) {
          try {
            const lead = manageLeads.find((l) => l.id === leadIds[0]);
            const result = await messageService.generateEmailDraft({
              lead_name: lead?.name || "",
              lead_company: lead?.company || "",
              lead_notes: lead?.notes || "",
              lead_stage: lead?.stage || "NEW",
              lead_score: lead?.score || 60,
              lead_source: lead?.source || "search",
              pain_point: lead?.notes || "",
              suggested_pitch: "",
              buying_signals: [],
              custom_context: "",
              tone: (tone as "professional" | "friendly" | "direct") || "professional",
              max_words: aiWordLimit,
            });
            addMessage({
              id: createId(),
              role: "agent",
              content: "",
              agentCard: {
                type: "message_draft",
                title: "Message Draft",
                description: `Draft for ${leadIds.length} lead(s)`,
                data: { lead_ids: leadIds, draft: result.body, tone: tone || "professional" },
                actions: [
                  { label: "Regenerate", action: "regenerate_message", payload: { lead_ids: leadIds, tone: tone || "professional" }, style: "secondary" },
                  { label: "Send", action: "send_message", payload: { lead_ids: leadIds }, style: "primary" },
                  { label: "Cancel", action: "cancel", style: "secondary" },
                ],
                requires_confirmation: true,
              },
            });
          } catch {
            addMessage({ id: createId(), role: "agent", content: "❌ Failed to regenerate message." });
          }
        }
        return;
      }

      if (action === "discover_with_filters") {
        const values = payload?.values as Record<string, string>;
        const query = values?.industry || values?.location || "leads";
        try {
          const results = await leadService.discoverLeads({ query, limit: 12 });
          addMessage({
            id: createId(),
            role: "agent",
            content: `Found ${results.length} leads for "${query}":`,
            agentCard: {
              type: "discovery_overview",
              title: `Discovered ${results.length} leads`,
              description: `Results for "${query}"`,
              data: { leads: results.map((l) => ({ id: l.id, name: l.author, company: l.company, score: l.score })), query },
              actions: [
                { label: "Go to Discovery Page", action: "navigate_discovery", style: "secondary" },
                { label: "Save All", action: "save_all_leads", payload: { leads: results }, style: "primary" },
              ],
            },
          });
        } catch {
          addMessage({ id: createId(), role: "agent", content: "❌ Discovery failed. Please try again." });
        }
        return;
      }

      if (action === "select_leads_for_message") {
        const leadIds = payload?.lead_ids as string[];
        if (leadIds && leadIds.length > 0) {
          await confirmAgentAction("select_leads_for_message", { lead_ids: leadIds });
        }
        return;
      }

      // Fallback: forward to backend
      await confirmAgentAction(action, payload);
    },
    [confirmAgentAction, manageLeads, tone, aiWordLimit],
  );

  const startNewChat = () => {
    if (messages.length > 0) {
      const session = createSessionFromMessages(messages, activeSessionId ?? undefined);
      if (session) {
        setChatHistory((prev) => [session, ...prev.filter((entry) => entry.id !== session.id)].slice(0, CHAT_HISTORY_LIMIT));
        void conversationMemoryService.saveSession(session, { immediate: true });
      }
    }

    setMessages([]);
    setInput("");
    setAttachedLeadIds([]);
    setHistoryOpen(false);
    setActiveSessionId(null);
    resetPlan();
    resetAgentConversation();
  };

  const restoreChat = (session: ChatSession) => {
    setMessages(session.messages);
    setInput("");
    setAttachedLeadIds([]);
    setHistoryOpen(false);
    setActiveSessionId(session.id);
  };

  const handleRenameChat = useCallback(async (id: string, newTitle: string) => {
    let updatedSession: ChatSession | null = null;

    setChatHistory((prev) => {
      const session = prev.find((s) => s.id === id);
      if (session) {
        updatedSession = { ...session, title: newTitle };
      }
      return prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
    });

    if (updatedSession && user) {
      await conversationMemoryService.saveSession(updatedSession, { immediate: true });
    }
  }, [user]);

  const handleDeleteChat = useCallback((id: string) => {
    const session = chatHistory.find((s) => s.id === id);
    if (session) setSessionToDelete(session);
  }, [chatHistory]);

  const confirmDeleteChat = useCallback(async () => {
    if (!sessionToDelete) return;
    setChatHistory((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
    await conversationMemoryService.deleteSession(sessionToDelete.id);
    if (activeSessionId === sessionToDelete.id) {
      setActiveSessionId(null);
      setMessages([]);
    }
    setSessionToDelete(null);
  }, [sessionToDelete, activeSessionId]);

  const visibleMessages = useMemo(() => {
    const base = messages.filter((message) => !message.hidden);
    if (!useConversationalAgent || mode !== "agent") return base;

    const converted: ChatMessage[] = agentConversationMessages.map((msg) => ({
      id: msg.id,
      role: msg.role === "user" ? "user" : "agent",
      content: msg.content,
      agentCard: msg.card,
      mode: "agent" as const,
    }));

    return [...base, ...converted];
  }, [messages, agentConversationMessages, useConversationalAgent, mode]);

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
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          onToggleMode={toggleMode}
        />

        <section className="mx-auto mt-4 flex w-full flex-1 min-h-0 flex-col gap-3">
          <div className="ai-chat-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-accent/[0.12] bg-surface/[0.2] p-4 pb-0 md:p-5 md:pb-0">
            <div className="mx-1 flex h-full w-full flex-col">
              <AIMessageFeed
                messages={visibleMessages}
                loading={loading || agentConversationLoading}
                mode={mode}
                endRef={endRef}
                suggestions={smartChips}
                agentPlan={useConversationalAgent ? null : agentPlan}
                executionState={useConversationalAgent ? null : executionState}
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
                onAgentCardAction={handleAgentCardAction}
              />
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
                onAgentChipClick={mode === "agent" ? (prompt) => void sendMessage(prompt) : undefined}
              />
            </div>
          </div>

        </section>

        <DeleteConfirmModal
          open={sessionToDelete !== null}
          title={sessionToDelete?.title ?? ""}
          onCancel={() => setSessionToDelete(null)}
          onConfirm={confirmDeleteChat}
        />

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
