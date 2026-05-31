import type { PropsWithChildren } from "react";

type SettingsSectionCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  badge?: string;
}>;

export const SettingsSectionCard = ({ title, description, badge, children }: SettingsSectionCardProps) => {
  return (
    <section className="glass-card overflow-hidden">
      <div className="border-b border-accent/10 bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-[0.08em] text-content uppercase">{title}</h3>
            {description ? <p className="mt-1 text-xs text-content-secondary">{description}</p> : null}
          </div>
          {badge ? <span className="badge-accent  text-white ">{badge}</span> : null}
        </div>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </section>
  );
};
