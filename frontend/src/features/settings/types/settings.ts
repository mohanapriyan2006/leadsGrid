import type { ManageLeadStage } from "../../leads/types/manageLead";
import type { EmailTemplateId } from "../../messages/types/emailTemplates";

export type RefreshInterval = "5" | "15" | "30" | "60";

export type ToneType = "professional" | "friendly" | "direct";
export type AiMode = "assist" | "auto";
export type MessageStyle = "short" | "medium" | "detailed";
export type PersonalizationLevel = "low" | "medium" | "high";
export type CurrencyCode = "USD" | "INR";

export type IntegrationStatus = "connected" | "needs_auth" | "disconnected";
export type BillingPlanKey =
  | "single_free"
  | "single_pro"
  | "single_max"
  | "org_normal"
  | "org_pro"
  | "org_max";

export type AppSettings = {
  profile: {
    name: string;
    email: string;
    avatarUrl: string;
    timezone: string;
    currency: CurrencyCode;
    portfolio: {
      github: string;
      website: string;
    };
    skills: string[];
  };
  workspace: {
    name: string;
    role: "owner" | "member";
    stageLabelMap: Record<ManageLeadStage, string>;
    preferredExportFields: string[];
  };
  leadsScoring: {
    minimumLeadScore: number;
    hotLeadAutoTag: boolean;
    autoMoveByScore: boolean;
    realtimeScoring: boolean;
    refreshInterval: RefreshInterval;
    weights: {
      urgency: number;
      budget: number;
      authority: number;
    };
  };
  messaging: {
    defaultTone: ToneType;
    defaultTemplateId: EmailTemplateId;
    autoFillSubject: boolean;
    signature: string;
    followUpReminderDays: number;
    followUpFinalDays: number;
    primaryEmail: string;
    secondaryEmail: string;
  };
  integrations: {
    gmail: IntegrationStatus;
    outlook: IntegrationStatus;
    linkedin: IntegrationStatus;
    reddit: IntegrationStatus;
    x: IntegrationStatus;
    webhook: {
      status: IntegrationStatus;
      apiKey: string;
    };
  };
  ai: {
    provider: "anthropic";
    mode: AiMode;
    messageStyle: MessageStyle;
    personalization: PersonalizationLevel;
    enableEvaluator: boolean;
    tokenUsageLimit: number;
  };
  notifications: {
    newLead: boolean;
    highIntentLead: boolean;
    messageReply: boolean;
    weeklyReport: boolean;
    channels: {
      email: boolean;
      inApp: boolean;
      whatsapp: boolean;
      telegram: boolean;
    };
  };
  billing: {
    currentPlan: BillingPlanKey;
    creditsRemaining: number;
    usage: {
      leadsScanned: number;
      aiMessagesGenerated: number;
    };
  };
  privacy: {
    retentionDays: number;
    complianceConsent: boolean;
  };
};

export type SettingsTabKey =
  | "profile"
  | "workspace"
  | "leads-scoring"
  | "messaging"
  | "integrations"
  | "ai-settings"
  | "notifications"
  | "billing"
  | "privacy-data";
