import type { ToneType } from "../../common/types/ui";

export type MockMessage = {
  id: string;
  leadId: string;
  leadName: string;
  tone: ToneType;
  content: string;
  confidence: number;
  createdAt: string;
};

export const MOCK_MESSAGES: MockMessage[] = [
  {
    id: "1",
    leadId: "1",
    leadName: "Sarah Chen",
    tone: "professional",
    content:
      "Hi Sarah,\n\nI saw your recent post about the frustration with robotic outbound tools.\n\nAt PitchPilot, we focused on contextual signal analysis + human-sounding drafts to help teams scale without losing message quality.\n\nWould you be open to a quick 10-minute walkthrough this week?\n\nBest,\nAlex",
    confidence: 98,
    createdAt: "2024-01-15",
  },
];
