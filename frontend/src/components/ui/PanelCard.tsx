import type { PropsWithChildren } from "react";

type PanelCardProps = PropsWithChildren<{
  className?: string;
}>;

export const PanelCard = ({ className = "", children }: PanelCardProps) => {
  return (
    <article className={`rounded-xl border border-white/10 bg-panel/80 p-4 shadow-aura backdrop-blur ${className}`}>
      {children}
    </article>
  );
};
