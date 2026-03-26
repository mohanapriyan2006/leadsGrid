import type { SourceType } from "../../features/common/types/ui";

type SourceIconProps = {
  source: SourceType;
};

const ICONS: Record<SourceType, string> = {
  linkedin: "in",
  twitter: "X",
  reddit: "r/",
};

const COLORS: Record<SourceType, string> = {
  linkedin: "#0A66C2",
  twitter: "#1D9BF0",
  reddit: "#FF4500",
};

export const SourceIcon = ({ source }: SourceIconProps) => {
  return (
    <span
      className="rounded border px-1.5 py-0.5 text-[10px] font-bold"
      style={{ background: `${COLORS[source]}22`, color: COLORS[source], borderColor: `${COLORS[source]}44` }}
    >
      {ICONS[source]}
    </span>
  );
};
