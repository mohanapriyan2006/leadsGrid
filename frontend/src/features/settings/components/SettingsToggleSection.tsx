import { SettingsToggle } from "./SettingsToggle";
import type { SettingToggleItem, ToggleSettingKey } from "../constants/settingsOptions";

type SettingsToggleSectionProps = {
  title: string;
  items: SettingToggleItem[];
  values: Record<ToggleSettingKey, boolean>;
  onToggle: (key: ToggleSettingKey) => void;
};

export const SettingsToggleSection = ({
  title,
  items,
  values,
  onToggle,
}: SettingsToggleSectionProps) => {
  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3 text-xs tracking-[0.1em]  text-content-tertiaryy">
        {title}
      </div>
      <div className="space-y-2 p-3">
        {items.map((item) => (
          <div key={item.key} className="glass-card-sm flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-content">{item.label}</p>
              <p className="text-xs text-content-secondary">{item.description}</p>
            </div>
            <SettingsToggle checked={values[item.key]} onChange={() => onToggle(item.key)} />
          </div>
        ))}
      </div>
    </section>
  );
};
