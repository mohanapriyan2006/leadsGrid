import type { AppSettings, IntegrationStatus } from "../../types/settings";
import { SettingsField } from "../SettingsField";
import { SettingsSectionCard } from "../SettingsSectionCard";

type IntegrationsSettingsSectionProps = {
  integrations: AppSettings["integrations"];
  onChange: (integrations: AppSettings["integrations"]) => void;
};

const nextStatus: Record<IntegrationStatus, IntegrationStatus> = {
  disconnected: "needs_auth",
  needs_auth: "connected",
  connected: "disconnected",
};

const statusClassName: Record<IntegrationStatus, string> = {
  connected: "badge-success",
  needs_auth: "badge-warning",
  disconnected: "badge-danger",
};

export const IntegrationsSettingsSection = ({
  integrations,
  onChange,
}: IntegrationsSettingsSectionProps) => {
  const providers: Array<{ key: keyof AppSettings["integrations"]; label: string }> = [
    { key: "gmail", label: "Gmail" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "reddit", label: "Reddit Scraping" },
    { key: "x", label: "X Scraping" },
  ];

  return (
    <SettingsSectionCard
      title="Integrations"
      description="Manage providers and source connectors."
      badge="Core Scaffold"
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {providers.map((provider) => {
          const status = integrations[provider.key] as IntegrationStatus;
          return (
            <div key={provider.key} className="glass-card-sm flex items-center justify-between px-3 py-3">
              <div>
                <p className="text-sm font-medium text-content">{provider.label}</p>
                <span className={statusClassName[status]}>{status.replace("_", " ")}</span>
              </div>
              <button
                type="button"
                className="glass-btn px-3 py-1 text-xs"
                onClick={() =>
                  onChange({
                    ...integrations,
                    [provider.key]: nextStatus[status],
                  })
                }
              >
                {status === "connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <SettingsField label="Webhook API Key" hint="Stored for secure server-side delivery.">
        <input
          className="glass-input"
          value={integrations.webhook.apiKey}
          onChange={(event) =>
            onChange({
              ...integrations,
              webhook: {
                ...integrations.webhook,
                apiKey: event.target.value,
                status: event.target.value.trim() ? "connected" : "disconnected",
              },
            })
          }
          placeholder="lg_sk_live_..."
        />
      </SettingsField>
    </SettingsSectionCard>
  );
};
