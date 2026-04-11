import type {
  AiMode,
  MessageStyle,
  PersonalizationLevel,
  RefreshInterval,
  SettingsTabKey,
  ToneType,
} from "../types/settings";

export type ToggleSettingKey = "notifications" | "autoScore" | "emailAlerts";

export type SettingToggleItem = {
  key: ToggleSettingKey;
  label: string;
  description: string;
};

export const NOTIFICATION_ITEMS: SettingToggleItem[] = [
  {
    key: "notifications",
    label: "Push Notifications",
    description: "Get alerts for high-intent leads",
  },
  {
    key: "emailAlerts",
    label: "Email Alerts",
    description: "Daily summary of fresh discovery signals",
  },
];

export const AI_ENGINE_ITEMS: SettingToggleItem[] = [
  {
    key: "autoScore",
    label: "Auto Scoring",
    description: "Automatically score newly discovered leads using AI.",
  },
];

export const REFRESH_INTERVALS: RefreshInterval[] = ["5", "15", "30", "60"];

export const TONE_OPTIONS: ToneType[] = ["professional", "friendly", "direct"];
export const AI_MODE_OPTIONS: AiMode[] = ["assist", "auto"];
export const AI_STYLE_OPTIONS: MessageStyle[] = ["short", "medium", "detailed"];
export const PERSONALIZATION_OPTIONS: PersonalizationLevel[] = ["low", "medium", "high"];

export const SETTINGS_TABS: Array<{
  key: SettingsTabKey;
  label: string;
  description: string;
}> = [
  { key: "profile", label: "Profile", description: "Identity and personalization" },
  { key: "workspace", label: "Workspace", description: "Team and pipeline controls" },
  { key: "leads-scoring", label: "Leads & Scoring", description: "BANT and scoring behavior" },
  { key: "messaging", label: "Messaging", description: "Outreach defaults and follow-up" },
  { key: "integrations", label: "Integrations", description: "Connected channels and data sources" },
  { key: "ai-settings", label: "AI Settings", description: "Agent mode and generation depth" },
  { key: "notifications", label: "Notifications", description: "Events and channels" },
  { key: "billing", label: "Billing", description: "Plan and credit usage" },
  { key: "privacy-data", label: "Privacy & Data", description: "Retention, export, and deletion" },
];
