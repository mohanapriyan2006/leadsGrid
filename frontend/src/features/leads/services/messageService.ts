import { apiClient, getStoredToken } from "../../../lib/api";

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
    const token = getStoredToken();
    const response = await apiClient.post<MessageGenerationResult>("/ai/message", payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },

  sendEmail: async (payload: SendEmailPayload): Promise<SendEmailResult> => {
    const token = getStoredToken();
    const response = await apiClient.post<SendEmailResult>("/messages/send", payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response.data;
  },
};
