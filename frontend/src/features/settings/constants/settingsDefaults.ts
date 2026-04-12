import type { AppSettings } from "../types/settings";

export const SETTINGS_DEFAULTS: AppSettings = {
  profile: {
    name: "",
    email: "",
    avatarUrl: "",
    timezone: "UTC",
    currency: "USD",
    portfolio: {
      github: "",
      website: "",
    },
    skills: [],
  },
  workspace: {
    name: "LeadsGrid Workspace",
    role: "owner",
    stageLabelMap: {
      NEW: "New",
      QUALIFIED: "Qualified",
      CONTACTED: "Contacted",
      RESPONDED: "Responded",
      NEGOTIATION: "Negotiation",
      CONTRACTED: "Contracted",
      IN_PROGRESS: "In Progress",
      CLOSED: "Closed",
    },
    preferredExportFields: ["name", "company", "email", "phone", "stage", "score", "notes"],
  },
  leadsScoring: {
    minimumLeadScore: 60,
    hotLeadAutoTag: true,
    autoMoveByScore: false,
    realtimeScoring: true,
    refreshInterval: "15",
    weights: {
      urgency: 30,
      budget: 30,
      authority: 40,
    },
  },
  messaging: {
    defaultTone: "professional",
    defaultTemplateId: "minimal-professional",
    autoFillSubject: true,
    signature: "Best regards,\nLeadsGrid Team",
    followUpReminderDays: 2,
    followUpFinalDays: 5,
    primaryEmail: "",
    secondaryEmail: "",
  },
  integrations: {
    gmail: "needs_auth",
    outlook: "disconnected",
    linkedin: "disconnected",
    reddit: "connected",
    x: "needs_auth",
    webhook: {
      status: "disconnected",
      apiKey: "",
    },
  },
  ai: {
    provider: "anthropic",
    mode: "assist",
    messageStyle: "medium",
    personalization: "medium",
    enableEvaluator: true,
    tokenUsageLimit: 50000,
  },
  notifications: {
    newLead: true,
    highIntentLead: true,
    messageReply: true,
    weeklyReport: false,
    channels: {
      email: true,
      inApp: true,
      whatsapp: false,
      telegram: false,
    },
  },
  billing: {
    currentPlan: "free",
    creditsRemaining: 240,
    usage: {
      leadsScanned: 1220,
      aiMessagesGenerated: 348,
    },
  },
  privacy: {
    retentionDays: 90,
    complianceConsent: true,
  },
};
