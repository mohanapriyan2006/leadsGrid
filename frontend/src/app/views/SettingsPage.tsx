import { useState } from "react";

import { PageBackground } from "../../components/ui/PageBackground";
import bgDataAtWork from "../../assets/bg-images/data-at-work.svg";

import { SETTINGS_DEFAULTS } from "../../features/settings/constants/settingsDefaults";
import {
  AI_ENGINE_ITEMS,
  NOTIFICATION_ITEMS,
  type ToggleSettingKey,
} from "../../features/settings/constants/settingsOptions";
import { SettingsIntervalSection } from "../../features/settings/components/SettingsIntervalSection";
import { SettingsToggleSection } from "../../features/settings/components/SettingsToggleSection";

export const SettingsPage = () => {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);

  const toggle = (key: ToggleSettingKey) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="page-with-bg">
      <PageBackground image={bgDataAtWork} tint="rgba(245, 158, 11, 0.80)" />
      <div className="h-[calc(100vh-100px)] overflow-auto space-y-4 p-6">
        <header className="glass-card p-5">
          <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">System Configuration</h2>
          <p className="mt-1 text-sm text-content-secondary">Configure outreach engine behavior and signal cadence.</p>
        </header>

        <SettingsToggleSection
          title="NOTIFICATIONS"
          items={NOTIFICATION_ITEMS}
          values={settings}
          onToggle={toggle}
        />

        <SettingsToggleSection
          title="AI ENGINE"
          items={AI_ENGINE_ITEMS}
          values={settings}
          onToggle={toggle}
        />

        <SettingsIntervalSection
          value={settings.refreshInterval}
          onChange={(value) => {
            setSettings((current) => ({ ...current, refreshInterval: value }));
          }}
        />

        <button className="accent-btn w-full py-3 text-xs font-bold tracking-[0.1em]">SAVE CONFIGURATION</button>
      </div>
    </div>
  );
};
