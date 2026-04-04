import type { CSSProperties, MouseEvent } from "react";

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function scoreColor(score: number) {
  if (score >= 85) return "#a78bfa";
  if (score >= 65) return "#8b5cf6";
  return "#64748b";
}

export function useRipple() {
  return (event: MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const rect = element.getBoundingClientRect();

    circle.className = "ripple-circle";
    Object.assign(circle.style, {
      width: `${diameter}px`,
      height: `${diameter}px`,
      left: `${event.clientX - rect.left - diameter / 2}px`,
      top: `${event.clientY - rect.top - diameter / 2}px`,
    });

    element.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };
}

export const SourceIcon = ({ source }: { source: string }) => {
  if (source === "linkedin") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  if (source === "reddit") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <path
          fill="var(--bg-card)"
          d="M15.5 10.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S14 12.83 14 12s.67-1.5 1.5-1.5zm-7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S7 12.83 7 12s.67-1.5 1.5-1.5zM12 16c2 0 3.5-1 3.5-1s-1 2-3.5 2-3.5-2-3.5-2 1.5 1 3.5 1z"
        />
      </svg>
    );
  }

  if (source === "hackernews") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path fill="var(--bg-card)" d="M8 7h2.2l1.8 3.5L13.8 7H16l-2.8 5.1V17h-2.3v-4.9z" />
      </svg>
    );
  }

  if (source === "search") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    );
  }

  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
};

export const AIIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM9 11a5 5 0 00-5 5v1h16v-1a5 5 0 00-5-5H9z" />
  </svg>
);

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "18px 20px",
      }}
    >
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 11, width: "38%" }} />
        </div>
        <div className="skeleton" style={{ width: 40, height: 30, borderRadius: 6 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div className="skeleton" style={{ height: 76, borderRadius: 10 }} />
        <div className="skeleton" style={{ height: 76, borderRadius: 10 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="skeleton" style={{ height: 11, width: "30%" }} />
        <div className="skeleton" style={{ height: 32, width: 110, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export const leadScoreStyle = (barWidth: string, score: number): CSSProperties => ({
  "--bar-w": barWidth,
  width: barWidth,
  background: scoreColor(score),
}) as CSSProperties;
