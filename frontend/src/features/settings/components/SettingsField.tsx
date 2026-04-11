import type { PropsWithChildren } from "react";

type SettingsFieldProps = PropsWithChildren<{
  label: string;
  hint?: string;
}>;

export const SettingsField = ({ label, hint, children }: SettingsFieldProps) => {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold tracking-[0.08em] text-content-secondary uppercase">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-content-tertiary">{hint}</span> : null}
    </label>
  );
};
