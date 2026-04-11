import { TONE_OPTIONS } from "../../constants/settingsOptions";
import { SettingsField } from "../SettingsField";
import { SettingsSectionCard } from "../SettingsSectionCard";
import { SettingsToggle } from "../SettingsToggle";
import type { AppSettings } from "../../types/settings";

type MessagingSettingsSectionProps = {
  messaging: AppSettings["messaging"];
  onChange: (messaging: AppSettings["messaging"]) => void;
};

export const MessagingSettingsSection = ({ messaging, onChange }: MessagingSettingsSectionProps) => {
  return (
    <SettingsSectionCard
      title="Messaging"
      description="Configure tone, signature, and automated follow-up behavior."
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase">Default Tone</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => onChange({ ...messaging, defaultTone: tone })}
              className={`rounded-glass-sm border px-3 py-2 text-sm capitalize transition-all duration-200 ${
                messaging.defaultTone === tone
                  ? "border-accent/50 bg-accent-soft text-accent shadow-glow"
                  : "border-accent/10 bg-surface-secondary/80 text-content-tertiary hover:border-accent/30 hover:text-content-secondary"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card-sm flex items-center justify-between px-3 py-2">
        <p className="text-sm text-content">Auto-fill subject line</p>
        <SettingsToggle
          checked={messaging.autoFillSubject}
          onChange={() => onChange({ ...messaging, autoFillSubject: !messaging.autoFillSubject })}
        />
      </div>

      {/* <div className="grid gap-3 md:grid-cols-2">
        <SettingsField label="Reminder Follow-up (Days)">
          <input
            type="number"
            min={1}
            max={14}
            className="glass-input"
            value={messaging.followUpReminderDays}
            onChange={(event) =>
              onChange({
                ...messaging,
                followUpReminderDays: Number(event.target.value) || 1,
              })
            }
          />
        </SettingsField>

        <SettingsField label="Final Follow-up (Days)">
          <input
            type="number"
            min={2}
            max={21}
            className="glass-input"
            value={messaging.followUpFinalDays}
            onChange={(event) =>
              onChange({
                ...messaging,
                followUpFinalDays: Number(event.target.value) || 2,
              })
            }
          />
        </SettingsField>
      </div> */}

      {/* <SettingsField label="Primary Email" hint="Used when a lead has no email address.">
        <input
          type="email"
          className="glass-input"
          value={messaging.fallbackEmail}
          onChange={(event) => onChange({ ...messaging, fallbackEmail: event.target.value })}
          placeholder="team@yourcompany.com"
        />
      </SettingsField>

      <SettingsField label="Fallback Email" hint="Used when a lead has no email address.">
        <input
          type="email"
          className="glass-input"
          value={messaging.fallbackEmail}
          onChange={(event) => onChange({ ...messaging, fallbackEmail: event.target.value })}
          placeholder="team@yourcompany.com"
        />
      </SettingsField> */}

      <SettingsField label="Email Signature">
        <textarea
          rows={4}
          className="glass-input"
          value={messaging.signature}
          onChange={(event) => onChange({ ...messaging, signature: event.target.value })}
        />
      </SettingsField>
    </SettingsSectionCard>
  );
};
