import type { ReactNode } from "react";

export const GradientBorderCard = ({
  children,
  className = "",
  active = false,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
}) => {
  return (
    <div
      className={`relative rounded-2xl p-[1px] ${active ? "animate-spin-slow" : ""} ${className}`}
      style={{
        background: active
          ? "conic-gradient(from 0deg, var(--accent), var(--accent-secondary), var(--accent-tertiary), var(--accent))"
          : "conic-gradient(from 0deg, rgba(167,139,250,0.3), rgba(139,92,246,0.1), rgba(99,102,241,0.3), rgba(167,139,250,0.3))",
      }}
    >
      <div className="relative h-full w-full rounded-2xl bg-surface p-6">{children}</div>
    </div>
  );
};
