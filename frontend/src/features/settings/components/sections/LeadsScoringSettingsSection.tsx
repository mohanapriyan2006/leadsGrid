import { REFRESH_INTERVALS } from "../../constants/settingsOptions";
import { SettingsToggle } from "../SettingsToggle";
import { SettingsSectionCard } from "../SettingsSectionCard";
import type { AppSettings } from "../../types/settings";

type LeadsScoringSettingsSectionProps = {
  leadsScoring: AppSettings["leadsScoring"];
  onChange: (leadsScoring: AppSettings["leadsScoring"]) => void;
};

const WeightInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <label className="space-y-1">
    <span className="text-xs text-content-secondary">{label}</span>
    <input
      type="number"
      min={0}
      max={100}
      className="glass-input"
      value={value}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
    />
  </label>
);

export const LeadsScoringSettingsSection = ({ leadsScoring, onChange }: LeadsScoringSettingsSectionProps) => {
  const weightTotal =
    leadsScoring.weights.urgency + leadsScoring.weights.budget + leadsScoring.weights.authority;

  return (
    <SettingsSectionCard
      title="Leads & Scoring"
      description="Control filtering, tagging, automation, and BANT weighting."
    >
      <label className="block space-y-2">
        <span className="text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase">
          Minimum Lead Score: {leadsScoring.minimumLeadScore}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={leadsScoring.minimumLeadScore}
          onChange={(event) =>
            onChange({
              ...leadsScoring,
              minimumLeadScore: Number(event.target.value),
            })
          }
          className="w-full accent-accent"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ["Hot lead auto-tag", leadsScoring.hotLeadAutoTag, "hotLeadAutoTag"],
          ["Auto-move by score", leadsScoring.autoMoveByScore, "autoMoveByScore"],
          ["Enable real-time scoring", leadsScoring.realtimeScoring, "realtimeScoring"],
        ].map(([label, value, key]) => (
          <div key={String(key)} className="glass-card-sm flex items-center justify-between px-3 py-2">
            <p className="text-sm text-content">{label}</p>
            <SettingsToggle
              checked={Boolean(value)}
              onChange={() =>
                onChange({
                  ...leadsScoring,
                  [key as string]: !value,
                })
              }
            />
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase">Scan Interval</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {REFRESH_INTERVALS.map((interval) => (
            <button
              key={interval}
              type="button"
              onClick={() => onChange({ ...leadsScoring, refreshInterval: interval })}
              className={`rounded-glass-sm border px-3 py-2 text-sm transition-all duration-200 ${
                leadsScoring.refreshInterval === interval
                  ? "border-accent/50 bg-accent-soft text-accent shadow-glow"
                  : "border-accent/10 bg-surface-secondary/80 text-content-tertiary hover:border-accent/30 hover:text-content-secondary"
              }`}
            >
              {interval}m
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase">BANT Weights</p>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <WeightInput
            label="Urgency %"
            value={leadsScoring.weights.urgency}
            onChange={(value) =>
              onChange({
                ...leadsScoring,
                weights: { ...leadsScoring.weights, urgency: value },
              })
            }
          />
          <WeightInput
            label="Budget %"
            value={leadsScoring.weights.budget}
            onChange={(value) =>
              onChange({
                ...leadsScoring,
                weights: { ...leadsScoring.weights, budget: value },
              })
            }
          />
          <WeightInput
            label="Authority %"
            value={leadsScoring.weights.authority}
            onChange={(value) =>
              onChange({
                ...leadsScoring,
                weights: { ...leadsScoring.weights, authority: value },
              })
            }
          />
        </div>
        <p className={`mt-2 text-xs ${weightTotal === 100 ? "text-success" : "text-warning"}`}>
          Weight total: {weightTotal}% {weightTotal !== 100 ? "(recommended 100%)" : "(balanced)"}
        </p>
      </div>
    </SettingsSectionCard>
  );
};
