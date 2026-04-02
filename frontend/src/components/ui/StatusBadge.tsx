import type { DealStatus } from "../../features/common/types/ui";

type StatusBadgeProps = {
  status: DealStatus;
};

const STATUS_STYLE: Record<DealStatus, { label: string; color: string; bg: string; border: string }> = {
  contracted: { label: "CONTRACTED", color: "var(--info)", bg: "var(--info-soft)", border: "rgba(6,182,212,0.3)" },
  "in-progress": { label: "IN PROGRESS", color: "var(--content-tertiary)", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)" },
  negotiation: { label: "NEGOTIATION", color: "var(--warning)", bg: "var(--warning-soft)", border: "rgba(245,158,11,0.3)" },
  closed: { label: "CLOSED", color: "var(--success)", bg: "var(--success-soft)", border: "rgba(16,185,129,0.3)" },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = STATUS_STYLE[status];

  return (
    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em]" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
      {style.label}
    </span>
  );
};
