import { addDoc, collection, Timestamp } from "firebase/firestore";

import { apiClient, getStoredToken } from "../../../lib/api";
import { db, getFirebaseAuth } from "../../../lib/firebase";
import { askAiService } from "../../ai/services/askAiService";
import type { AIContextPayload } from "../../ai/types/context";
import type { HyperPersonalizedOutreachRequest, HyperPersonalizedOutreachResult } from "../types/lead";
import { usageTracker } from "../../billing/services/usageTracker";
import { showLimitModal } from "../../billing/hooks/useLimitModal";

export type MessageGenerationPayload = {
  prompt?: string;
  lead_context: string;
  structured_context?: AIContextPayload;
  tone: "professional" | "friendly" | "direct";
  max_words: number;
};

export type MessageGenerationResult = {
  message: string;
  confidence: number;
  provider: string;
  draft?: string | null;
  evaluation?: string | null;
  requires_agent?: boolean;
};

export type EmailDraftGenerationPayload = {
  lead_name: string;
  lead_company: string;
  lead_notes: string;
  lead_stage: string;
  lead_score: number;
  lead_source: string;
  pain_point: string;
  suggested_pitch: string;
  buying_signals: string[];
  custom_context: string;
  tone: "professional" | "friendly" | "direct";
  max_words: number;
};

export type EmailDraftGenerationResult = {
  subject: string;
  body: string;
  confidence: number;
  provider: string;
};

export type SendEmailPayload = {
  to: string;
  subject: string;
  message: string;
  body_plain?: string;
  body_html?: string;
  lead_id: string;
  template_id?: string;
  primary_color?: string;
  secondary_color?: string;
  sender_name?: string;
  reply_to?: string;
  attachment?: {
    filename: string;
    content_type: string;
    content_base64: string;
    size_bytes: number;
  };
  custom_args?: Record<string, string | number | boolean>;
};

export type SendEmailResult = {
  status: string;
  message_id: string;
  lead_id: string;
  to: string;
  subject: string;
  provider: string;
  sent_at: string;
};

const buildAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};
  const auth = getFirebaseAuth();

  if (auth?.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
    headers["x-user-id"] = auth.currentUser.uid;
    if (auth.currentUser.email) {
      headers["x-user-email"] = auth.currentUser.email;
    }
    return headers;
  }

  const storedToken = getStoredToken();
  if (storedToken) {
    headers.Authorization = `Bearer ${storedToken}`;
  }

  return headers;
};

export const messageService = {
  generateMessage: async (payload: MessageGenerationPayload): Promise<MessageGenerationResult> => {
    const result = await askAiService.generateText({
      prompt: payload.prompt ?? payload.lead_context,
      tone: payload.tone,
      maxWords: payload.max_words,
      context: payload.structured_context,
    });

    return {
      message: result.text,
      confidence: result.confidence,
      provider: result.provider,
      draft: result.text,
      requires_agent: result.requiresAgent,
    };
  },

  generateEmailDraft: async (payload: EmailDraftGenerationPayload): Promise<EmailDraftGenerationResult> => {
    const headers = await buildAuthHeaders();
    const response = await apiClient.post<EmailDraftGenerationResult>(
      "/email/generate",
      payload,
      { headers },
    );
    return response.data;
  },

  sendEmail: async (payload: SendEmailPayload): Promise<SendEmailResult> => {
    const limitCheck = await usageTracker.checkLimit("email_sending_per_day", 1);
    if (!limitCheck.allowed) {
      showLimitModal({ action: "email_sending_per_day", current: limitCheck.current, limit: limitCheck.limit });
      throw new Error("Plan limit reached: Email Sending");
    }

    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error("Unauthenticated or Firebase not configured");
    }

    const headers = await buildAuthHeaders();
    const response = await apiClient.post<SendEmailResult>(
      "/email/send",
      {
        to: payload.to,
        subject: payload.subject,
        message: payload.message,
        body_plain: payload.body_plain,
        body_html: payload.body_html,
        lead_id: payload.lead_id,
        template_id: payload.template_id,
        primary_color: payload.primary_color,
        secondary_color: payload.secondary_color,
        sender_name: payload.sender_name,
        reply_to: payload.reply_to,
        attachment: payload.attachment,
        custom_args: payload.custom_args,
      },
      { headers },
    );

    const sendResult = response.data;

    const messageDoc = await addDoc(collection(db, "users", uid, "leads", payload.lead_id, "messages"), {
      email: payload.to,
      subject: payload.subject,
      content: payload.message,
      status: sendResult.status,
      provider: sendResult.provider,
      messageId: sendResult.message_id,
      createdAt: Timestamp.now(),
    });

    await usageTracker.incrementUsage("email_sending_per_day", 1);

    return {
      status: sendResult.status,
      message_id: sendResult.message_id || messageDoc.id,
      lead_id: payload.lead_id,
      to: payload.to,
      subject: payload.subject,
      provider: sendResult.provider,
      sent_at: sendResult.sent_at,
    };
  },

  generateHyperPersonalizedOutreach: async (
    payload: HyperPersonalizedOutreachRequest,
  ): Promise<HyperPersonalizedOutreachResult> => {
    const headers = await buildAuthHeaders();
    const response = await apiClient.post<HyperPersonalizedOutreachResult>(
      "/leads/generate-hyper-personalized-outreach",
      payload,
      { headers },
    );

    return response.data;
  },
};
