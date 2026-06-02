import { useState, useCallback } from "react";
import { usageTracker } from "../services/usageTracker";
import { showLimitModal } from "./useLimitModal";

export const useAnalysisGate = () => {
  const [analysisRun, setAnalysisRun] = useState(false);
  const [checking, setChecking] = useState(false);

  const runAnalysis = useCallback(async () => {
    setChecking(true);
    try {
      const result = await usageTracker.checkLimit("crm_ai_analysis_per_day", 1);
      if (!result.allowed) {
        showLimitModal({
          action: "crm_ai_analysis_per_day",
          current: result.current,
          limit: result.limit,
        });
        return;
      }
      await usageTracker.incrementUsage("crm_ai_analysis_per_day", 1);
      setAnalysisRun(true);
    } finally {
      setChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysisRun(false);
  }, []);

  return { analysisRun, runAnalysis, checking, reset };
};
