type ScoreBadgeProps = {
  score: number;
};

export const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const color = score >= 90 ? "var(--warning)" : score >= 75 ? "var(--accent)" : "var(--content-tertiary)";
  const glow = score >= 90 ? "0 0 12px rgba(245,158,11,0.5)" : score >= 75 ? "0 0 12px rgba(167,139,250,0.4)" : "none";

  return (
    <span style={{ color, fontWeight: 700, fontSize: "1.25rem", textShadow: glow, fontFamily: "monospace" }}>
      {score}
    </span>
  );
};
