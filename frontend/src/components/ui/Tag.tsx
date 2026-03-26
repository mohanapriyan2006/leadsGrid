type TagProps = {
  label: string;
};

const COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "HOT SIGNAL": { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "rgba(245,158,11,0.3)" },
  BUDGET_CONFIRMED: { bg: "rgba(16,185,129,0.1)", color: "#10B981", border: "rgba(16,185,129,0.3)" },
  ENTERPRISE: { bg: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "rgba(139,92,246,0.3)" },
  DECISION_MAKER: { bg: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "rgba(59,130,246,0.3)" },
  URGENT: { bg: "rgba(239,68,68,0.1)", color: "#EF4444", border: "rgba(239,68,68,0.3)" },
  EXPANSION: { bg: "rgba(156,163,175,0.1)", color: "#9CA3AF", border: "rgba(156,163,175,0.2)" },
};

export const Tag = ({ label }: TagProps) => {
  const style = COLORS[label] ?? COLORS.EXPANSION;

  return (
    <span
      className="rounded border px-2 py-0.5 text-[10px] font-bold tracking-[0.08em]"
      style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      {label}
    </span>
  );
};
