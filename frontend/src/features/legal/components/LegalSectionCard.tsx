import type { ReactNode } from "react";

import { GlassCard } from "../../landing/components/ui/GlassCard";

type Props = {
  title: string;
  children: ReactNode;
};

export const LegalSectionCard = ({ title, children }: Props) => {
  return (
    <GlassCard className="h-full">
      <h3 className="text-lg font-semibold text-content">{title}</h3>
      <div className="mt-4 space-y-3 text-sm text-content-secondary">{children}</div>
    </GlassCard>
  );
};