import {
  AI_MODE_OPTIONS,
  AI_STYLE_OPTIONS,
  PERSONALIZATION_OPTIONS,
} from "../../constants/settingsOptions";
import { SettingsField } from "../SettingsField";
import { SettingsSectionCard } from "../SettingsSectionCard";
import { SettingsToggle } from "../SettingsToggle";
import type { AppSettings } from "../../types/settings";

type AISettingsSectionProps = {
  ai: AppSettings["ai"];
  onChange: (ai: AppSettings["ai"]) => void;
};

const OptionButtons = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (next: T) => void;
}) => (
  <div className="mt-2 grid grid-cols-3 gap-2">
    {options.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={`rounded-glass-sm border px-3 py-2 text-sm capitalize transition-all duration-200 ${
          value === option
            ? "border-accent/50 bg-accent-soft  shadow-glow"
            : "border-accent/10 bg-surface-secondary/80   hover:border-accent/30 hover:text-content-secondary"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

export const AISettingsSection = ({ ai, onChange }: AISettingsSectionProps) => {
  return (
    <SettingsSectionCard
      title="AI Settings"
      description="Control autonomy, generation depth, and token safety limits."
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase">
          Message Generation Style
        </p>
        <OptionButtons
          value={ai.messageStyle}
          options={AI_STYLE_OPTIONS}
          onChange={(messageStyle) => onChange({ ...ai, messageStyle })}
        />
      </div>

      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase">
          Personalization Level
        </p>
        <OptionButtons
          value={ai.personalization}
          options={PERSONALIZATION_OPTIONS}
          onChange={(personalization) => onChange({ ...ai, personalization })}
        />
      </div>

      <div className="glass-card-sm flex items-center justify-between px-3 py-2">
        <p className="text-sm text-content">Enable evaluator quality checks</p>
        <SettingsToggle
          checked={ai.enableEvaluator}
          onChange={() =>
            onChange({ ...ai, enableEvaluator: !ai.enableEvaluator })
          }
        />
      </div>
    </SettingsSectionCard>
  );
};
