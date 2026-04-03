import type { AIStatus } from "../types/agent";

type StatusIndicatorProps = {
  status: AIStatus;
};

const STATUS_CONFIG: Record<AIStatus, { label: string; color: string; textColor: string; pulse: boolean }> = {
  idle: { label: "Idle", color: "bg-content-tertiary/60", textColor: "text-content-tertiary", pulse: false },
  thinking: { label: "Thinking", color: "bg-warning", textColor: "text-warning", pulse: true },
  executing: { label: "Executing", color: "bg-info", textColor: "text-info", pulse: true },
};

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-accent/[0.06] bg-surface-secondary/30 px-2.5 py-1">
      <span className="relative flex h-2 w-2">
        {config.pulse ? (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${config.color}`}
          />
        ) : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.color}`} />
      </span>
      <span className={`text-[11px] font-medium ${config.textColor}`}>{config.label}</span>
    </div>
  );
};
