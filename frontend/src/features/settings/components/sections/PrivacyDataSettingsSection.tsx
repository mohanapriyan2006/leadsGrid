import { SettingsField } from "../SettingsField";
import { SettingsSectionCard } from "../SettingsSectionCard";
import { SettingsToggle } from "../SettingsToggle";
import type { AppSettings } from "../../types/settings";

type PrivacyDataSettingsSectionProps = {
  privacy: AppSettings["privacy"];
  onChange: (privacy: AppSettings["privacy"]) => void;
  onOpenDeleteFlow: () => void;
  onOpenLogoutConfirm: () => void;
  onExportLeads: () => void;
};

export const PrivacyDataSettingsSection = ({
  privacy,
  onChange,
  onOpenDeleteFlow,
  onOpenLogoutConfirm,
  onExportLeads,
}: PrivacyDataSettingsSectionProps) => {
  return (
    <SettingsSectionCard
      title="Privacy & Data"
      description="Define retention and account-level safety controls."
    >
      <SettingsField label="Data Retention (Days)">
        <input
          type="number"
          min={7}
          max={3650}
          className="glass-input"
          value={privacy.retentionDays}
          onChange={(event) =>
            onChange({
              ...privacy,
              retentionDays: Number(event.target.value) || 7,
            })
          }
        />
      </SettingsField>

      <div className="glass-card-sm flex items-center justify-between px-3 py-2">
        <div>
          <p className="text-sm text-content">Consent and compliance confirmation</p>
          <p className="text-xs text-content-secondary">Required for automated processing workflows.</p>
        </div>
        <SettingsToggle
          checked={privacy.complianceConsent}
          onChange={() =>
            onChange({
              ...privacy,
              complianceConsent: !privacy.complianceConsent,
            })
          }
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" className="glass-btn py-2 text-xs" onClick={onExportLeads}>
          Export Leads CSV
        </button>
        <button type="button" className="glass-btn py-2 text-xs" onClick={onOpenLogoutConfirm}>
          Log Out
        </button>
        <button
          type="button"
          className="rounded-glass-sm border border-danger/30 bg-danger-soft py-2 text-xs font-semibold"
          onClick={onOpenDeleteFlow}
        >
          Delete Account
        </button>
      </div>
    </SettingsSectionCard>
  );
};
