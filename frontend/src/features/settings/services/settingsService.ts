import { SETTINGS_DEFAULTS } from "../constants/settingsDefaults";
import type { AppSettings } from "../types/settings";

const STORAGE_KEY = "leadsgrid.settings.v1";

const cloneDefaults = () => JSON.parse(JSON.stringify(SETTINGS_DEFAULTS)) as AppSettings;

const coerceArray = (value: unknown) => (Array.isArray(value) ? value : []);

const coerceString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const coerceNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const coerceBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const normalizeSettings = (raw: unknown): AppSettings => {
  const defaults = cloneDefaults();
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const candidate = raw as Partial<AppSettings>;

  return {
    profile: {
      ...defaults.profile,
      ...candidate.profile,
      portfolio: {
        ...defaults.profile.portfolio,
        ...(candidate.profile?.portfolio ?? {}),
      },
      skills: coerceArray(candidate.profile?.skills).map((entry) => String(entry).trim()).filter(Boolean),
    },
    workspace: {
      ...defaults.workspace,
      ...candidate.workspace,
      pipelineStages: coerceArray(candidate.workspace?.pipelineStages)
        .map((entry) => String(entry).trim())
        .filter(Boolean),
    },
    leadsScoring: {
      ...defaults.leadsScoring,
      ...candidate.leadsScoring,
      weights: {
        ...defaults.leadsScoring.weights,
        ...(candidate.leadsScoring?.weights ?? {}),
      },
      minimumLeadScore: Math.max(
        0,
        Math.min(100, coerceNumber(candidate.leadsScoring?.minimumLeadScore, defaults.leadsScoring.minimumLeadScore)),
      ),
    },
    messaging: {
      ...defaults.messaging,
      ...candidate.messaging,
    },
    integrations: {
      ...defaults.integrations,
      ...candidate.integrations,
      webhook: {
        ...defaults.integrations.webhook,
        ...(candidate.integrations?.webhook ?? {}),
      },
    },
    ai: {
      ...defaults.ai,
      ...candidate.ai,
      tokenUsageLimit: Math.max(1000, coerceNumber(candidate.ai?.tokenUsageLimit, defaults.ai.tokenUsageLimit)),
    },
    notifications: {
      ...defaults.notifications,
      ...candidate.notifications,
      channels: {
        ...defaults.notifications.channels,
        ...(candidate.notifications?.channels ?? {}),
      },
    },
    billing: {
      ...defaults.billing,
      ...candidate.billing,
      usage: {
        ...defaults.billing.usage,
        ...(candidate.billing?.usage ?? {}),
      },
      creditsRemaining: Math.max(0, coerceNumber(candidate.billing?.creditsRemaining, defaults.billing.creditsRemaining)),
    },
    privacy: {
      ...defaults.privacy,
      ...candidate.privacy,
      retentionDays: Math.max(7, coerceNumber(candidate.privacy?.retentionDays, defaults.privacy.retentionDays)),
      complianceConsent: coerceBoolean(candidate.privacy?.complianceConsent, defaults.privacy.complianceConsent),
    },
  };
};

export const settingsService = {
  async load(): Promise<AppSettings> {
    if (typeof window === "undefined") {
      return cloneDefaults();
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneDefaults();
    }
    try {
      return normalizeSettings(JSON.parse(raw));
    } catch {
      return cloneDefaults();
    }
  },

  async save(settings: AppSettings): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSettings(settings)));
  },

  normalize(settings: unknown): AppSettings {
    return normalizeSettings(settings);
  },

  mergeWithDefaults(settings: unknown): AppSettings {
    return normalizeSettings(settings);
  },
};
