import { Sparkles, Loader2 } from "lucide-react";

type RunAnalysisPromptProps = {
  onRun: () => void;
  checking: boolean;
  remaining?: number | null;
  limit?: number | null;
};

export const RunAnalysisPrompt = ({
  onRun,
  checking,
  remaining,
  limit,
}: RunAnalysisPromptProps) => {
  return (
    <section className="glass-card flex flex-col items-center justify-center space-y-5 p-8 text-center sm:p-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
        <Sparkles className="h-7 w-7 text-accent" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-content">AI Analysis</h3>
        <p className="max-w-md text-sm text-content-secondary">
          Run an AI-powered analysis to unlock predictive insights, deal
          recommendations, and pipeline intelligence tailored to your data.
        </p>
      </div>

      <button
        type="button"
        onClick={onRun}
        disabled={checking}
        className="accent-btn flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {checking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking limit...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Run AI Analysis
          </>
        )}
      </button>

      {typeof remaining === "number" && typeof limit === "number" ? (
        <p className="text-[11px] text-content-secondary">
          {remaining.toLocaleString()} / {limit.toLocaleString()} analyses
          remaining today
        </p>
      ) : null}
    </section>
  );
};
