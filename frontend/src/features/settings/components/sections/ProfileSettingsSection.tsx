import { SettingsField } from "../SettingsField";
import { SettingsSectionCard } from "../SettingsSectionCard";
import type { AppSettings } from "../../types/settings";

type ProfileSettingsSectionProps = {
  profile: AppSettings["profile"];
  onChange: (profile: AppSettings["profile"]) => void;
};

const TIMEZONES = ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Dubai"];

export const ProfileSettingsSection = ({ profile, onChange }: ProfileSettingsSectionProps) => {
  const skillsText = profile.skills.join(", ");

  return (
    <SettingsSectionCard
      title="Profile"
      description="Identity and personalization used by the AI outreach engine."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <SettingsField label="Name">
          <input
            className="glass-input"
            value={profile.name}
            onChange={(event) => onChange({ ...profile, name: event.target.value })}
            placeholder="Your full name"
          />
        </SettingsField>

        <SettingsField label="Email">
          <input className="glass-input" value={profile.email} readOnly />
        </SettingsField>

        <SettingsField label="Timezone">
          <select
            className="glass-input"
            value={profile.timezone}
            onChange={(event) => onChange({ ...profile, timezone: event.target.value })}
          >
            {TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone} className="bg-surface-tertiary">
                {timezone}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField label="Default Currency">
          <select
            className="glass-input"
            value={profile.currency}
            onChange={(event) =>
              onChange({
                ...profile,
                currency: event.target.value as AppSettings["profile"]["currency"],
              })
            }
          >
            <option value="USD" className="bg-surface-tertiary">USD ($)</option>
            <option value="INR" className="bg-surface-tertiary">INR (₹)</option>
          </select>
        </SettingsField>

        <SettingsField label="GitHub URL">
          <input
            className="glass-input"
            value={profile.portfolio.github}
            onChange={(event) =>
              onChange({
                ...profile,
                portfolio: { ...profile.portfolio, github: event.target.value },
              })
            }
            placeholder="https://github.com/username"
          />
        </SettingsField>

        <SettingsField label="Website URL">
          <input
            className="glass-input"
            value={profile.portfolio.website}
            onChange={(event) =>
              onChange({
                ...profile,
                portfolio: { ...profile.portfolio, website: event.target.value },
              })
            }
            placeholder="https://yourdomain.com"
          />
        </SettingsField>
      </div>

      <SettingsField label="Skills Tags" hint="Comma-separated skills help AI personalize messaging.">
        <input
          className="glass-input"
          value={skillsText}
          onChange={(event) =>
            onChange({
              ...profile,
              skills: event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          placeholder="SaaS, B2B Sales, Growth"
        />
      </SettingsField>
    </SettingsSectionCard>
  );
};
