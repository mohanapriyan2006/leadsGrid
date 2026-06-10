import { useState, useCallback } from "react";
import { usageTracker } from "../services/usageTracker";
import { showLimitModal } from "./useLimitModal";
import type { UsageAction } from "../constants/usage";

export const useAnalysisGate = (action: UsageAction = "crm_analysis_per_day") => {
  const [analysisRun, setAnalysisRun] = useState(false);
  const [checking, setChecking] = useState(false);

  const runAnalysis = useCallback(async () => {
    setChecking(true);
    try {
      const result = await usageTracker.checkLimit(action, 1);
      if (!result.allowed) {
        showLimitModal({
          action,
          current: result.current,
          limit: result.limit,
        });
        return;
      }
      await usageTracker.incrementUsage(action, 1);
      setAnalysisRun(true);
    } finally {
      setChecking(false);
    }
  }, [action]);

  const reset = useCallback(() => {
    setAnalysisRun(false);
  }, []);

  return { analysisRun, runAnalysis, checking, reset };
};
