type SettingsToggleProps = {
  checked: boolean;
  onChange: () => void;
};

export const SettingsToggle = ({ checked, onChange }: SettingsToggleProps) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
        checked ? "bg-accent shadow-glow" : "bg-surface-elevated"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-content transition-all duration-300 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
};
