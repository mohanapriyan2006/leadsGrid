import { useState, useCallback } from "react";

import { apiClient } from "../../../lib/api";
import { getFirebaseAuth } from "../../../lib/firebase";
import type { AgentCardData } from "../types/agent";

export type AgentChatMessage = {
  id: string;
  role: "user" | "agent";
  content: string;
  card?: AgentCardData;
  timestamp: string;
};

type ChatResponse = {
  agent_message: {
    id: string;
    role: "user" | "agent";
    type: string;
    content: string;
    card: AgentCardData | null;
    timestamp: string;
  };
  session_id: string;
  requires_confirmation: boolean;
};

export const useAgentConversation = (attachedLeadIds: string[] = []) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const buildHeaders = async () => {
    const headers: Record<string, string> = {};
    const auth = getFirebaseAuth();
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
      headers["x-user-id"] = auth.currentUser.uid;
    }
    return headers;
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setLoading(true);
      const userMsg: AgentChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const headers = await buildHeaders();
        const response = await apiClient.post<ChatResponse>(
          "/agent/chat",
          { message: text, session_id: sessionId, attached_lead_ids: attachedLeadIds },
          { headers },
        );

        const data = response.data;
        if (data.session_id) {
          setSessionId(data.session_id);
        }

        const agentMsg: AgentChatMessage = {
          id: data.agent_message.id,
          role: "agent",
          content: data.agent_message.content,
          card: data.agent_message.card ?? undefined,
          timestamp: data.agent_message.timestamp,
        };
        setMessages((prev) => [...prev, agentMsg]);
      } catch {
        const errorMsg: AgentChatMessage = {
          id: crypto.randomUUID(),
          role: "agent",
          content: "Sorry, I'm having trouble processing that. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, attachedLeadIds],
  );

  const confirmAction = useCallback(
    async (actionId: string, payload?: Record<string, unknown>) => {
      if (!sessionId) return;
      setLoading(true);

      try {
        const headers = await buildHeaders();
        const response = await apiClient.post<ChatResponse>(
          "/agent/chat",
          {
            message: "",
            session_id: sessionId,
            attached_lead_ids: attachedLeadIds,
            confirmed_action: { action: actionId, payload },
          },
          { headers },
        );

        const data = response.data;
        const agentMsg: AgentChatMessage = {
          id: data.agent_message.id,
          role: "agent",
          content: data.agent_message.content,
          card: data.agent_message.card ?? undefined,
          timestamp: data.agent_message.timestamp,
        };
        setMessages((prev) => [...prev, agentMsg]);
      } catch {
        const errorMsg: AgentChatMessage = {
          id: crypto.randomUUID(),
          role: "agent",
          content: "Action failed. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, attachedLeadIds],
  );

  const cancelAction = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      const headers = await buildHeaders();
      const response = await apiClient.post<ChatResponse>(
        "/agent/chat",
        {
          message: "",
          session_id: sessionId,
          attached_lead_ids: attachedLeadIds,
          confirmed_action: { action: "cancel" },
        },
        { headers },
      );

      const data = response.data;
      const agentMsg: AgentChatMessage = {
        id: data.agent_message.id,
        role: "agent",
        content: data.agent_message.content,
        card: data.agent_message.card ?? undefined,
        timestamp: data.agent_message.timestamp,
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [sessionId, attachedLeadIds]);

  const reset = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setLoading(false);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    confirmAction,
    cancelAction,
    reset,
  };
};
