import { useEffect, useMemo, useState } from "react";

import { SETTINGS_DEFAULTS } from "../constants/settingsDefaults";
import { SETTINGS_UPDATED_EVENT, settingsService } from "../services/settingsService";
import type { AppSettings } from "../types/settings";

const stringify = (value: AppSettings) => JSON.stringify(value);

export const useSettingsState = (userEmail: string | null | undefined) => {
  const [settings, setSettings] = useState<AppSettings>(SETTINGS_DEFAULTS);
  const [baseline, setBaseline] = useState<AppSettings>(SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const applyUserMessagingDefaults = (candidate: AppSettings): AppSettings => ({
    ...candidate,
    profile: {
      ...candidate.profile,
      email: userEmail ?? candidate.profile.email,
    },
    messaging: {
      ...candidate.messaging,
      primaryEmail: userEmail ?? candidate.messaging.primaryEmail,
    },
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const loaded = await settingsService.load();
      const normalized = settingsService.mergeWithDefaults(applyUserMessagingDefaults(loaded));
      setSettings(normalized);
      setBaseline(normalized);
      setLoading(false);
    };

    void load();
  }, [userEmail]);

  useEffect(() => {
    const syncFromStorage = async () => {
      const loaded = await settingsService.load();
      const normalized = settingsService.mergeWithDefaults(applyUserMessagingDefaults(loaded));
      setSettings(normalized);
      setBaseline(normalized);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "leadsgrid.settings.v1") {
        return;
      }
      void syncFromStorage();
    };

    const onSettingsUpdated = () => {
      void syncFromStorage();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(SETTINGS_UPDATED_EVENT, onSettingsUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, onSettingsUpdated);
    };
  }, [userEmail]);

  const isDirty = useMemo(() => stringify(settings) !== stringify(baseline), [settings, baseline]);

  const updateSettings = (updater: (current: AppSettings) => AppSettings) => {
    setSettings((current) => {
      const next = updater(current);
      return settingsService.normalize(applyUserMessagingDefaults(next));
    });
    setSaveMessage(null);
    setSaveError(null);
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const normalized = settingsService.normalize(applyUserMessagingDefaults(settings));
      await settingsService.save(normalized);
      setSettings(normalized);
      setBaseline(normalized);
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
