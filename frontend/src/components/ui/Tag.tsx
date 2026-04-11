type TagProps = {
  label: string;
};

const COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "HOT SIGNAL": { bg: "var(--warning-soft)", color: "var(--warning)", border: "rgba(245,158,11,0.3)" },
  BUDGET_CONFIRMED: { bg: "var(--success-soft)", color: "var(--success)", border: "rgba(16,185,129,0.3)" },
  ENTERPRISE: { bg: "var(--accent-soft)", color: "var(--accent-secondary)", border: "rgba(139,92,246,0.3)" },
  DECISION_MAKER: { bg: "var(--info-soft)", color: "var(--info)", border: "rgba(6,182,212,0.3)" },
  URGENT: { bg: "var(--danger-soft)", color: "var(--danger)", border: "rgba(239,68,68,0.3)" },
  EXPANSION: { bg: "rgba(148,163,184,0.1)", color: "var(--content-secondary)", border: "rgba(148,163,184,0.2)" },
};

export const Tag = ({ label }: TagProps) => {
  const style = COLORS[label] ?? COLORS.EXPANSION;

  return (
    <span
      className="rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.08em]"
      style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      {label}
    </span>
  );
};
