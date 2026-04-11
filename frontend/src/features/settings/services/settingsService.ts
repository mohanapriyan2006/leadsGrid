import { SETTINGS_DEFAULTS } from "../constants/settingsDefaults";
import type { AppSettings } from "../types/settings";

const STORAGE_KEY = "leadsgrid.settings.v1";
export const SETTINGS_UPDATED_EVENT = "leadsgrid:settings-updated";

const cloneDefaults = () => JSON.parse(JSON.stringify(SETTINGS_DEFAULTS)) as AppSettings;

const coerceArray = (value: unknown) => (Array.isArray(value) ? value : []);

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

  const legacyPipelineStages = coerceArray((candidate.workspace as { pipelineStages?: unknown[] } | undefined)?.pipelineStages)
    .map((entry) => String(entry).trim())
    .filter(Boolean);

  const workspaceStageLabelMap = {
    ...defaults.workspace.stageLabelMap,
    ...(candidate.workspace?.stageLabelMap ?? {}),
  };

  // Migrate old 4-stage array format to the first four manage pipeline stages.
  if (legacyPipelineStages[0]) workspaceStageLabelMap.NEW = legacyPipelineStages[0];
  if (legacyPipelineStages[1]) workspaceStageLabelMap.QUALIFIED = legacyPipelineStages[1];
  if (legacyPipelineStages[2]) workspaceStageLabelMap.CONTACTED = legacyPipelineStages[2];
  if (legacyPipelineStages[3]) workspaceStageLabelMap.RESPONDED = legacyPipelineStages[3];

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
      stageLabelMap: workspaceStageLabelMap,
      preferredExportFields: coerceArray(candidate.workspace?.preferredExportFields)
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
    const normalized = normalizeSettings(settings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: normalized }));
  },

  normalize(settings: unknown): AppSettings {
    return normalizeSettings(settings);
  },

  mergeWithDefaults(settings: unknown): AppSettings {
    return normalizeSettings(settings);
  },
};
