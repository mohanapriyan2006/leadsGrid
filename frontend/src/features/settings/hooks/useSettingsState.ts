import { useEffect, useMemo, useState } from "react";

import { SETTINGS_DEFAULTS } from "../constants/settingsDefaults";
import { settingsService } from "../services/settingsService";
import type { AppSettings } from "../types/settings";

const stringify = (value: AppSettings) => JSON.stringify(value);

export const useSettingsState = (userEmail: string | null | undefined) => {
  const [settings, setSettings] = useState<AppSettings>(SETTINGS_DEFAULTS);
  const [baseline, setBaseline] = useState<AppSettings>(SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const loaded = await settingsService.load();
      const normalized = settingsService.mergeWithDefaults({
        ...loaded,
        profile: {
          ...loaded.profile,
          email: userEmail ?? loaded.profile.email,
        },
      });
      setSettings(normalized);
      setBaseline(normalized);
      setLoading(false);
    };

    void load();
  }, [userEmail]);

  const isDirty = useMemo(() => stringify(settings) !== stringify(baseline), [settings, baseline]);

  const updateSettings = (updater: (current: AppSettings) => AppSettings) => {
    setSettings((current) => {
      const next = updater(current);
      return settingsService.normalize(next);
    });
    setSaveMessage(null);
    setSaveError(null);
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await settingsService.save(settings);
      setBaseline(settings);
      setSaveMessage("Configuration saved successfully.");
    } catch {
      setSaveError("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    setSettings,
    updateSettings,
    loading,
    saving,
    saveError,
    saveMessage,
    isDirty,
    saveSettings,
  };
};
