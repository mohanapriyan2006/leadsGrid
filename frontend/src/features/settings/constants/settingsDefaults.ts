export type AppSettings = {
  notifications: boolean;
  autoScore: boolean;
  aiProvider: "anthropic";
  refreshInterval: "5" | "15" | "30" | "60";
  emailAlerts: boolean;
};

export const SETTINGS_DEFAULTS: AppSettings = {
  notifications: true,
  autoScore: true,
  aiProvider: "anthropic",
  refreshInterval: "15",
  emailAlerts: false,
};
