import { useState } from "react";

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
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-accent" : "bg-white/20"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
    </button>
  );

  return (
    <div className="max-w-3xl space-y-4">
      <header>
        <h2 className="text-3xl font-semibold text-white">System Configuration</h2>
        <p className="text-sm text-text-dim">Configure outreach engine behavior and signal cadence.</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-panel/80 shadow-aura">
        <div className="border-b border-white/10 px-4 py-3 text-xs tracking-[0.1em] text-text-dim">NOTIFICATIONS</div>
        <div className="space-y-1 p-3">
          {[{ key: "notifications" as const, label: "Push Notifications", desc: "Get alerts for high-intent leads" }, { key: "emailAlerts" as const, label: "Email Alerts", desc: "Daily summary of fresh discovery signals" }].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded border border-white/10 bg-black/20 px-3 py-3">
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-text-dim">{item.desc}</p>
              </div>
              <Toggle checked={settings[item.key]} onChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-panel/80 shadow-aura">
        <div className="border-b border-white/10 px-4 py-3 text-xs tracking-[0.1em] text-text-dim">AI ENGINE</div>
        <div className="p-3">
          <div className="flex items-center justify-between rounded border border-white/10 bg-black/20 px-3 py-3">
            <div>
              <p className="text-sm text-white">Auto Scoring</p>
              <p className="text-xs text-text-dim">Automatically score newly discovered leads using AI.</p>
            </div>
            <Toggle checked={settings.autoScore} onChange={() => toggle("autoScore")} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-panel/80 shadow-aura">
        <div className="border-b border-white/10 px-4 py-3 text-xs tracking-[0.1em] text-text-dim">SCAN INTERVAL</div>
        <div className="grid grid-cols-4 gap-2 p-3">
          {(["5", "15", "30", "60"] as const).map((interval) => (
            <button
              key={interval}
              onClick={() => setSettings((current) => ({ ...current, refreshInterval: interval }))}
              className={`rounded border px-3 py-2 text-sm ${settings.refreshInterval === interval ? "border-accent/50 bg-accent/10 text-accent" : "border-white/10 bg-black/20 text-text-dim"}`}
            >
              {interval}m
            </button>
          ))}
        </div>
      </section>

      <button className="w-full rounded bg-gradient-to-br from-accentSoft to-indigo-600 px-4 py-3 text-xs font-bold tracking-[0.1em] text-white">SAVE CONFIGURATION</button>
    </div>
  );
};
