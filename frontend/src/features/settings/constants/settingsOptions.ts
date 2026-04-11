import type { AppSettings } from "./settingsDefaults";

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

export const REFRESH_INTERVALS: AppSettings["refreshInterval"][] = ["5", "15", "30", "60"];
