import type { ReactNode } from "react";

export const MarqueeBand = ({
  children,
  speed = 25,
  pauseOnHover = true,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={`group relative overflow-hidden ${className}`}
    >
      <div
        className={`flex w-max animate-marquee ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center gap-8 pr-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8 pr-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8 pr-8">{children}</div>
      </div>
    </div>
  );
};
