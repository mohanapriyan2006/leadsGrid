import type { ActiveContext } from "../types/agent";

type ContextBarProps = {
  context: ActiveContext;
};

const CONTEXT_ICONS: Record<ActiveContext["type"], string> = {
  lead: "👤",
  pipeline: "📊",
  none: "🔗",
};

export const ContextBar = ({ context }: ContextBarProps) => {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-accent/[0.06] bg-surface-secondary/30 px-2.5 py-1">
      <span className="text-[10px]">{CONTEXT_ICONS[context.type]}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-content-tertiary">
        ctx
      </span>
      <span className="text-[11px] text-content-secondary">{context.label}</span>
    </div>
  );
};
