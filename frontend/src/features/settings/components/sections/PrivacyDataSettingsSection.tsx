import { SettingsSectionCard } from "../SettingsSectionCard";
import type { AppSettings } from "../../types/settings";

type PrivacyDataSettingsSectionProps = {
  onOpenDeleteFlow: () => void;
  onOpenLogoutConfirm: () => void;
  onExportLeads: () => void;
};

export const PrivacyDataSettingsSection = ({
  onOpenDeleteFlow,
  onOpenLogoutConfirm,
  onExportLeads,
}: PrivacyDataSettingsSectionProps) => {
  return (
    <SettingsSectionCard
      title="Privacy & Data"
      description="Manage your data and account security."
    >
        <div className="glass-card-sm px-4 py-3 space-y-3">
          <div>
            <p className="text-sm font-semibold text-content mb-2">Your Data</p>
            <p className="text-xs text-content-secondary leading-relaxed">
              We collect and store data related to your leads, messaging history, and account settings to provide our services. Your data is encrypted and stored securely.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-content mb-2">Data Usage</p>
            <p className="text-xs text-content-secondary leading-relaxed">
              Your data is used to power lead discovery, AI-powered messaging, and analytics. We do not sell your data to third parties.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-content mb-2">Data Export</p>
            <p className="text-xs text-content-secondary leading-relaxed">
              You can export all your leads data at any time in CSV format for your records.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-content mb-2">Account Deletion</p>
            <p className="text-xs text-content-secondary leading-relaxed">
              Deleting your account permanently removes all your data including leads, messages, and settings. This action cannot be undone.
            </p>
          </div>
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
            className="rounded-glass-sm border border-danger/30 bg-danger-soft py-2 text-xs font-semibold text-danger"
            onClick={onOpenDeleteFlow}
          >
            Delete Account
          </button>
        </div>
    </SettingsSectionCard>
  );
};
