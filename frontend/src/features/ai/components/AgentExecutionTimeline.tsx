import type { AgentPlan, AgentExecutionState } from "../types/agent";

type AgentExecutionTimelineProps = {
  plan: AgentPlan;
  executionState: AgentExecutionState;
  onContinue: () => void;
  onAbort: () => void;
};

export const AgentExecutionTimeline = ({
  plan,
  executionState,
  onContinue,
  onAbort,
}: AgentExecutionTimelineProps) => {
  const progress =
    executionState.totalSteps > 0
      ? Math.round((executionState.completedSteps / executionState.totalSteps) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-info/[0.1] bg-surface-secondary/40 p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/[0.08] text-sm">
            ⚡
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-content">Execution Progress</h4>
            <p className="text-[10px] text-content-tertiary">
              {executionState.completedSteps}/{executionState.totalSteps} steps
            </p>
          </div>
        </div>
        <span className="text-[13px] font-bold text-info">{progress}%</span>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-surface/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-info to-accent/80 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative space-y-0">
        {plan.steps.map((step, index) => {
          const isLast = index === plan.steps.length - 1;

          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                    step.status === "completed"
                      ? "bg-success/15 text-success"
                      : step.status === "running"
                        ? "bg-info/15 text-info animate-pulse"
                        : step.status === "failed"
                          ? "bg-danger/15 text-danger"
                          : "bg-accent/[0.06] text-content-tertiary"
                  }`}
                >
                  {step.status === "completed" ? "✓" : step.status === "running" ? "●" : step.status === "failed" ? "✕" : index + 1}
                </div>
                {!isLast ? (
                  <div
                    className={`w-px flex-1 min-h-[16px] ${
                      step.status === "completed" ? "bg-success/20" : "bg-accent/[0.06]"
                    }`}
                  />
                ) : null}
              </div>

              <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-2"}`}>
                <p
                  className={`text-[13px] font-medium ${
                    step.status === "completed"
                      ? "text-success/80"
                      : step.status === "running"
                        ? "text-info"
                        : step.status === "failed"
                          ? "text-danger/80"
                          : "text-content-tertiary"
                  }`}
                >
                  {step.label}
                </p>
                {step.result ? (
                  <p className="mt-0.5 text-[11px] text-content-tertiary">{step.result}</p>
                ) : null}
                {step.evaluation ? (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-content-tertiary">
                    <span className="rounded-md border border-accent/[0.08] bg-surface/60 px-1.5 py-0.5">
                      Quality {step.evaluation.score}/100
                    </span>
                    {step.evaluation.issues.slice(0, 2).map((issue) => (
                      <span key={issue} className="rounded-md border border-warning/[0.12] bg-warning/[0.05] px-1.5 py-0.5 text-warning/80">
                        {issue}
                      </span>
                    ))}
                  </div>
                ) : null}
                {step.error ? (
                  <p className="mt-0.5 text-[11px] text-danger/70">{step.error}</p>
                ) : null}
                {step.status === "running" ? (
                  <p className="mt-0.5 text-[11px] text-info/60 animate-pulse">Processing...</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {executionState.isPaused ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-warning/[0.1] bg-warning/[0.04] px-3.5 py-2.5">
          <span className="text-[12px] text-warning/80 font-medium">
            ⏸ Waiting for approval on step {executionState.currentStepIndex + 1}
          </span>
          <span className="ml-auto text-[11px] text-content-tertiary">Review the permission modal to continue.</span>
        </div>
      ) : null}

      {executionState.status === "completed" && executionState.completedAt ? (
        <div className="mt-3 rounded-xl border border-success/[0.1] bg-success/[0.04] px-3.5 py-2.5">
          <p className="text-[12px] font-medium text-success/80">
            ✓ All steps completed successfully
          </p>
        </div>
      ) : null}

      {executionState.status === "failed" ? (
        <div className="mt-3 rounded-xl border border-danger/[0.1] bg-danger/[0.04] px-3.5 py-2.5">
          <p className="text-[12px] font-medium text-danger/80">✕ Execution stopped due to a failed step</p>
        </div>
      ) : null}

      {executionState.status === "aborted" ? (
        <div className="mt-3 rounded-xl border border-warning/[0.1] bg-warning/[0.04] px-3.5 py-2.5">
          <p className="text-[12px] font-medium text-warning/80">⛔ Execution aborted</p>
        </div>
      ) : null}

      {executionState.isRunning && !executionState.isPaused ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onAbort}
            className="rounded-lg border border-danger/[0.1] bg-danger/[0.05] px-3 py-1.5 text-[11px] font-medium text-danger/60 transition hover:bg-danger/[0.1] hover:text-danger"
          >
            Abort
          </button>
        </div>
      ) : null}
    </div>
  );
};
