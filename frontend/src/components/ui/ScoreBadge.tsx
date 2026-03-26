type ScoreBadgeProps = {
  score: number;
};

export const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const color = score >= 90 ? "#F59E0B" : score >= 75 ? "#B595FF" : "#9CA3AF";
  const glow = score >= 90 ? "0 0 12px rgba(245,158,11,0.5)" : score >= 75 ? "0 0 12px rgba(181,149,255,0.4)" : "none";

  return (
    <span style={{ color, fontWeight: 700, fontSize: "1.25rem", textShadow: glow, fontFamily: "monospace" }}>
      {score}
    </span>
  );
};
