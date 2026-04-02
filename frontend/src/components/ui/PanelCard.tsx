import type { PropsWithChildren } from "react";

type PanelCardProps = PropsWithChildren<{
  className?: string;
}>;

export const PanelCard = ({ className = "", children }: PanelCardProps) => {
  return (
    <article className={`glass-card p-4 ${className}`}>
      {children}
    </article>
  );
};
