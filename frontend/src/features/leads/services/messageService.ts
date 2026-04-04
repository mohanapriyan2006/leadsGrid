import { addDoc, collection, Timestamp } from "firebase/firestore";

import { db, getFirebaseAuth } from "../../../lib/firebase";
import { askAiService } from "../../ai/services/askAiService";

export type MessageGenerationPayload = {
  lead_context: string;
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

export type SendEmailPayload = {
  to: string;
  subject: string;
  message: string;
  lead_id: string;
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

export const messageService = {
  generateMessage: async (payload: MessageGenerationPayload): Promise<MessageGenerationResult> => {
    const result = await askAiService.generateText({
      prompt: payload.lead_context,
      tone: payload.tone,
      maxWords: payload.max_words,
    });

    return {
      message: result.text,
      confidence: result.confidence,
      provider: result.provider,
      draft: result.text,
      requires_agent: result.requiresAgent,
    };
  },

  sendEmail: async (payload: SendEmailPayload): Promise<SendEmailResult> => {
    const auth = getFirebaseAuth();
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      throw new Error("Unauthenticated or Firebase not configured");
    }

    const messageDoc = await addDoc(collection(db, "users", uid, "leads", payload.lead_id, "messages"), {
      email: payload.to,
      subject: payload.subject,
      content: payload.message,
      status: "sent",
      createdAt: Timestamp.now(),
    });

    return {
      status: "sent",
      message_id: messageDoc.id,
      lead_id: payload.lead_id,
      to: payload.to,
      subject: payload.subject,
      provider: "firestore",
      sent_at: new Date().toISOString(),
    };
  },
};
