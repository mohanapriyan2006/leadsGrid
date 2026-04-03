export type ChatRole = "assistant" | "user";

export type InsightCard = {
  leadName: string;
  score: number;
  budget: string;
  pain: string[];
  suggestion: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  card?: InsightCard;
  hidden?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  messages: ChatMessage[];
};
