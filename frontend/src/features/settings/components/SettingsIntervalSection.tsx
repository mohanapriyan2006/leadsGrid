import type { RefreshInterval } from "../types/settings";

import { REFRESH_INTERVALS } from "../constants/settingsOptions";

type SettingsIntervalSectionProps = {
  value: RefreshInterval;
  onChange: (value: RefreshInterval) => void;
};

export const SettingsIntervalSection = ({
  value,
  onChange,
}: SettingsIntervalSectionProps) => {
  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3 text-xs tracking-[0.1em]  ">
        SCAN INTERVAL
      </div>
      <div className="grid grid-cols-4 gap-2 p-3">
        {REFRESH_INTERVALS.map((interval) => (
          <button
            key={interval}
            type="button"
            onClick={() => onChange(interval)}
            className={`rounded-glass-sm border px-3 py-2 text-sm transition-all duration-200 ${
              value === interval
                ? "border-accent/50 bg-accent-soft text-accent shadow-glow"
                : "border-accent/10 bg-surface-secondary/80   hover:border-accent/30 hover:text-content-secondary"
            }`}
          >
            {interval}m
          </button>
        ))}
      </div>
    </section>
  );
};
