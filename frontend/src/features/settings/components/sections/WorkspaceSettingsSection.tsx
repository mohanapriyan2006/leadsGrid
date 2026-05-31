import { SettingsField } from "../SettingsField";
import { SettingsSectionCard } from "../SettingsSectionCard";
import type { AppSettings } from "../../types/settings";
import type { ManageLeadStage } from "../../../leads/types/manageLead";

const STAGE_ORDER: ManageLeadStage[] = [
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "RESPONDED",
  "NEGOTIATION",
  "CONTRACTED",
  "IN_PROGRESS",
  "CLOSED",
];

type WorkspaceSettingsSectionProps = {
  workspace: AppSettings["workspace"];
  onChange: (workspace: AppSettings["workspace"]) => void;
};

export const WorkspaceSettingsSection = ({
  workspace,
  onChange,
}: WorkspaceSettingsSectionProps) => {
  const exportFieldsText = workspace.preferredExportFields.join(", ");

  return (
    <SettingsSectionCard
      title="Workspace"
      description="Manage workspace naming and your default pipeline order."
      badge="Core + Future"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <SettingsField label="Workspace Name">
          <input
            className="glass-input"
            value={workspace.name}
            onChange={(event) =>
              onChange({ ...workspace, name: event.target.value })
            }
            placeholder="Workspace name"
          />
        </SettingsField>
      </div>

      <div className="glass-card-sm overflow-hidden">
        <div className="grid grid-cols-[1.2fr_2fr] border-b border-accent/10 bg-gradient-to-r from-accent/5 to-transparent px-3 py-2 text-[10px] uppercase tracking-[0.16em]  text-content-tertiaryy">
          <span>System Stage</span>
          <span>Custom Label (User View)</span>
        </div>
        <div className="divide-y divide-accent/10">
          {STAGE_ORDER.map((stageKey) => (
            <div
              key={stageKey}
              className="grid grid-cols-[1.2fr_2fr] items-center gap-2 px-3 py-2"
            >
              <span className="text-xs font-semibold text-content-secondary">
                {stageKey}
              </span>
              <input
                className="glass-input py-2 text-xs"
                value={workspace.stageLabelMap[stageKey]}
                onChange={(event) =>
                  onChange({
                    ...workspace,
                    stageLabelMap: {
                      ...workspace.stageLabelMap,
                      [stageKey]: event.target.value,
                    },
                  })
                }
                placeholder={`Label for ${stageKey}`}
              />
            </div>
          ))}
        </div>
      </div>

      <SettingsField
        label="Preferred Export Fields"
        hint="Comma-separated. Example: name, company, email, stage, score, notes"
      >
        <input
          className="glass-input"
          value={exportFieldsText}
          onChange={(event) =>
            onChange({
              ...workspace,
              preferredExportFields: event.target.value
                .split(",")
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean),
            })
          }
        />
      </SettingsField>

      <div className="glass-card-sm border border-warning/20 bg-warning/10 px-3 py-2">
        <p className="text-xs text-warning">
          Team members and permission management are planned next.
        </p>
      </div>
    </SettingsSectionCard>
  );
};
