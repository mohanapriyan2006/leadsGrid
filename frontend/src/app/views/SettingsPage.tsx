import { useState } from "react";

import { PageBackground } from "../../components/ui/PageBackground";
import bgDataAtWork from "../../assets/bg-images/data-at-work.svg";

import { SETTINGS_DEFAULTS } from "../../features/settings/constants/settingsDefaults";

export const SettingsPage = () => {
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);

  const toggle = (key: "notifications" | "autoScore" | "emailAlerts") => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-all duration-300 ${checked ? "bg-accent shadow-glow" : "bg-surface-elevated"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-content transition-all duration-300 ${checked ? "left-6" : "left-1"}`} />
    </button>
  );

  return (
    <div className="page-with-bg max-w-3xl space-y-4">
      <PageBackground image={bgDataAtWork} tint="rgba(245, 158, 11, 0.80)" />
      <header className="glass-card p-5">
        <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-3xl font-semibold text-transparent">System Configuration</h2>
        <p className="mt-1 text-sm text-content-secondary">Configure outreach engine behavior and signal cadence.</p>
      </header>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3 text-xs tracking-[0.1em] text-content-tertiary">NOTIFICATIONS</div>
        <div className="space-y-2 p-3">
          {[{ key: "notifications" as const, label: "Push Notifications", desc: "Get alerts for high-intent leads" }, { key: "emailAlerts" as const, label: "Email Alerts", desc: "Daily summary of fresh discovery signals" }].map((item) => (
            <div key={item.key} className="glass-card-sm flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-content">{item.label}</p>
                <p className="text-xs text-content-secondary">{item.desc}</p>
              </div>
              <Toggle checked={settings[item.key]} onChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3 text-xs tracking-[0.1em] text-content-tertiary">AI ENGINE</div>
        <div className="p-3">
          <div className="glass-card-sm flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-content">Auto Scoring</p>
              <p className="text-xs text-content-secondary">Automatically score newly discovered leads using AI.</p>
            </div>
            <Toggle checked={settings.autoScore} onChange={() => toggle("autoScore")} />
          </div>
        </div>
      </section>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3 text-xs tracking-[0.1em] text-content-tertiary">SCAN INTERVAL</div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {(["5", "15", "30", "60"] as const).map((interval) => (
            <button
              key={interval}
              onClick={() => setSettings((current) => ({ ...current, refreshInterval: interval }))}
              className={`rounded-glass-sm border px-3 py-2 text-sm transition-all duration-200 ${settings.refreshInterval === interval ? "border-accent/50 bg-accent-soft text-accent shadow-glow" : "border-accent/10 bg-surface-secondary/80 text-content-tertiary hover:border-accent/30 hover:text-content-secondary"}`}
            >
              {interval}m
            </button>
          ))}
        </div>
      </section>

      <button className="accent-btn w-full py-3 text-xs font-bold tracking-[0.1em]">SAVE CONFIGURATION</button>
    </div>
  );
};
