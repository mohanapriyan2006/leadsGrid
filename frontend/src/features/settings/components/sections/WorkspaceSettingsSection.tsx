import { SettingsField } from "../SettingsField";
import { SettingsSectionCard } from "../SettingsSectionCard";
import type { AppSettings } from "../../types/settings";

type WorkspaceSettingsSectionProps = {
  workspace: AppSettings["workspace"];
  onChange: (workspace: AppSettings["workspace"]) => void;
};

export const WorkspaceSettingsSection = ({ workspace, onChange }: WorkspaceSettingsSectionProps) => {
  const stagesText = workspace.pipelineStages.join(", ");

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
            onChange={(event) => onChange({ ...workspace, name: event.target.value })}
            placeholder="Workspace name"
          />
        </SettingsField>

        <SettingsField label="Your Role">
          <select
            className="glass-input"
            value={workspace.role}
            onChange={(event) =>
              onChange({
                ...workspace,
                role: event.target.value as AppSettings["workspace"]["role"],
              })
            }
          >
            <option className="bg-surface-tertiary" value="owner">Owner</option>
            <option className="bg-surface-tertiary" value="member">Member</option>
          </select>
        </SettingsField>
      </div>

      <SettingsField label="Pipeline Stages" hint="Comma-separated. Example: New, Qualified, Negotiation, Closed">
        <input
          className="glass-input"
          value={stagesText}
          onChange={(event) =>
            onChange({
              ...workspace,
              pipelineStages: event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </SettingsField>

      <div className="glass-card-sm border border-warning/20 bg-warning/10 px-3 py-2">
        <p className="text-xs text-warning">Team members and permission management are planned next.</p>
      </div>
    </SettingsSectionCard>
  );
};
