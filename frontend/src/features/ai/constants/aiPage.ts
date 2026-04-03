import type { ToneType } from "../../common/types/ui";

export const QUICK_ACTIONS = [
  "Find leads",
  "Best lead",
  "Next action",
  "Draft message",
  "Analyze pipeline",
] as const;

export type QuickAction = (typeof QUICK_ACTIONS)[number];

export const QUICK_ACTION_PROMPT: Record<QuickAction, string> = {
  "Find leads": "Find high-intent leads from my pipeline and explain why.",
  "Best lead": "Who is the best lead to contact today?",
  "Next action": "What is the next best action for my top lead?",
  "Draft message": "Draft a personalized outreach message for my top lead.",
  "Analyze pipeline": "Analyze current pipeline and suggest immediate moves.",
};

export const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const FILE_ACCEPT = "image/*,.pdf,.csv";
export const CHAT_HISTORY_LIMIT = 10;

export const TONES: ToneType[] = ["professional", "friendly", "direct"];
