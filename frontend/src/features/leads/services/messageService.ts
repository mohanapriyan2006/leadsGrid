import { addDoc, collection, Timestamp } from "firebase/firestore";

import { db, getFirebaseAuth } from "../../../lib/firebase";

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
    const context = payload.lead_context.slice(0, payload.max_words * 6);
    const message = `Hi there,\n\nBased on your context, here is a ${payload.tone} draft:\n${context}\n\nBest regards,`;
    return {
      message,
      confidence: 80,
      provider: "firebase-local",
      draft: message,
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
