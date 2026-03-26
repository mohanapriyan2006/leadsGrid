import type { DealStatus } from "../../features/common/types/ui";

type StatusBadgeProps = {
  status: DealStatus;
};

const STATUS_STYLE: Record<DealStatus, { label: string; color: string; bg: string }> = {
  contacted: { label: "CONTACTED", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  replied: { label: "REPLIED", color: "#60A5FA", bg: "rgba(96,165,250,0.1)" },
  negotiation: { label: "NEGOTIATION", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  closed: { label: "CLOSED", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = STATUS_STYLE[status];

  return (
    <span className="rounded px-2.5 py-1 text-[10px] font-bold tracking-[0.08em]" style={{ background: style.bg, color: style.color }}>
      {style.label}
    </span>
  );
};
