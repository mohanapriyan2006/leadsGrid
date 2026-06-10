import { useState, useCallback, useEffect, useRef } from "react";

import type { Lead } from "../../leads/types/lead";
import type { AgentPlan, AgentStep, AgentExecutionState, AIStatus } from "../types/agent";
import { agentApiService } from "../services/agentApiService";
import type { AgentActionResult, AgentRunState } from "../services/agentApiService";
import { agentRunRealtimeService } from "../services/agentRunRealtimeService";
import { usageTracker } from "../../billing/services/usageTracker";
import { showLimitModal } from "../../billing/hooks/useLimitModal";

type ExecutionCallbacks = {
  onStepStart: (step: AgentStep, index: number) => void;
  onStepComplete: (step: AgentStep, index: number, result: AgentActionResult) => void;
  onStepFail: (step: AgentStep, index: number, error: string) => void;
  onPlanComplete: (plan: AgentPlan) => void;
  onStatusChange: (status: AIStatus) => void;
};

export const useAgentExecution = (callbacks: ExecutionCallbacks) => {
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [executionState, setExecutionState] = useState<AgentExecutionState | null>(null);
  const unsubscribeRef = useRef<null | (() => void)>(null);
  const planRef = useRef<AgentPlan | null>(null);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const stopRunWatch = useCallback(() => {
    if (!unsubscribeRef.current) return;
    unsubscribeRef.current();
    unsubscribeRef.current = null;
  }, []);

  const toExecutionState = useCallback((run: AgentRunState): AgentExecutionState => {
    return {
      runId: run.runId,
      planId: run.plan.id,
      status: run.status,
      currentStepIndex: run.currentStepIndex,
      isRunning: run.status === "running",
      isPaused: run.status === "paused",
      completedSteps: run.completedSteps,
      totalSteps: run.totalSteps,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
    };
  }, []);

  const applyRunState = useCallback(
    (run: AgentRunState, previousPlan: AgentPlan | null) => {
      run.plan.steps.forEach((step, index) => {
        const previousStatus = previousPlan?.steps[index]?.status;
        if (previousStatus === step.status) {
          return;
        }

        if (step.status === "running") {
          callbacks.onStepStart(step, index);
          return;
        }

        if (step.status === "completed") {
          const result: AgentActionResult = {
            success: true,
            message: step.result || `${step.label} completed`,
            data: {},
          };
          callbacks.onStepComplete(step, index, result);
          return;
        }

        if (step.status === "failed") {
          callbacks.onStepFail(step, index, step.error || "Step failed");
        }
      });

      setPlan(run.plan);
      setExecutionState(toExecutionState(run));

      if (run.status === "completed") {
        stopRunWatch();
        callbacks.onStatusChange("idle");
        callbacks.onPlanComplete(run.plan);
      } else if (run.status === "failed" || run.status === "aborted") {
        stopRunWatch();
        callbacks.onStatusChange("idle");
      }
    },
    [callbacks, toExecutionState, stopRunWatch],
  );

  const startRunWatch = useCallback(
    (runId: string) => {
      stopRunWatch();
      unsubscribeRef.current = agentRunRealtimeService.subscribeToRun(runId, (run) => {
        applyRunState(run, planRef.current);
      });
    },
    [stopRunWatch, applyRunState],
  );

  const createPlan = useCallback(
    async (prompt: string, leads: Lead[]): Promise<AgentPlan> => {
      const backendPlan = await agentApiService.createPlan(prompt, leads);
      setPlan(backendPlan);
      setExecutionState(null);
      return backendPlan;
    },
    [],
  );

  const approvePlan = useCallback(
    (approvalMode: "all" | "step_by_step") => {
      setPlan((prev) => {
        if (!prev) return prev;
        return { ...prev, approved: true, approvalMode };
      });
    },
    [],
  );

  const editPlanStep = useCallback(
    (stepId: string, updates: Partial<Pick<AgentStep, "label" | "description">>) => {
      setPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          steps: prev.steps.map((s) =>
            s.id === stepId ? { ...s, ...updates } : s,
          ),
        };
      });
    },
    [],
  );

  const removeStep = useCallback((stepId: string) => {
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.filter((s) => s.id !== stepId),
      };
    });
  }, []);

  const executePlan = useCallback(
    async (
      currentPlan: AgentPlan,
      leads: Lead[],
      prompt: string,
      tone: string,
      autoApproveLowRisk: boolean,
    ) => {
      if (!currentPlan.approved) return;

      const limitCheck = await usageTracker.checkLimit("agent_ai_per_month", 1);
      if (!limitCheck.allowed) {
        showLimitModal({ action: "agent_ai_per_month", current: limitCheck.current, limit: limitCheck.limit });
        callbacks.onStatusChange("idle");
        return;
      }

      callbacks.onStatusChange("executing");

      try {
        await usageTracker.incrementUsage("agent_ai_per_month", 1);
        const run = await agentApiService.startRun({
          prompt,
          leads,
          tone,
          approvalMode: currentPlan.approvalMode || "all",
          autoApproveLowRisk,
          autoSave: true,
        });
        applyRunState(run, currentPlan);
        startRunWatch(run.runId);
      } catch {
        callbacks.onStatusChange("idle");
      }
    },
    [callbacks, applyRunState, startRunWatch],
  );

  const continueExecution = useCallback(
    async (leads: Lead[], prompt: string, tone: string, autoApproveLowRisk: boolean) => {
      void leads;
      void prompt;
      void tone;

      if (!executionState?.runId) return;

      callbacks.onStatusChange("executing");
      try {
        const run = await agentApiService.approveStep(executionState.runId, autoApproveLowRisk);
        applyRunState(run, plan);
      } catch {
        callbacks.onStatusChange("idle");
      }
    },
    [executionState?.runId, callbacks, applyRunState, plan],
  );

  const skipCurrentStep = useCallback(
    async (leads: Lead[], prompt: string, tone: string, autoApproveLowRisk: boolean) => {
      void leads;
      void prompt;
      void tone;

      if (!executionState?.runId) return;

      callbacks.onStatusChange("executing");
      try {
        const run = await agentApiService.skipStep(executionState.runId, autoApproveLowRisk);
        applyRunState(run, plan);
      } catch {
        callbacks.onStatusChange("idle");
      }
    },
    [executionState?.runId, callbacks, applyRunState, plan],
  );

  const abortExecution = useCallback(() => {
    const runId = executionState?.runId;
    callbacks.onStatusChange("idle");

    if (!runId) {
      setExecutionState((prev) =>
        prev
          ? {
              ...prev,
              status: "aborted",
              isRunning: false,
              isPaused: false,
              completedAt: new Date().toISOString(),
            }
          : prev,
      );
      return;
    }

    void agentApiService
      .abortRun(runId)
      .then((run) => {
        applyRunState(run, plan);
      })
      .catch(() => {
        setExecutionState((prev) =>
          prev
            ? {
                ...prev,
                status: "aborted",
                isRunning: false,
                isPaused: false,
                completedAt: new Date().toISOString(),
              }
            : prev,
        );
      });
  }, [executionState?.runId, callbacks, applyRunState, plan]);

  const resetPlan = useCallback(() => {
    stopRunWatch();
    setPlan(null);
    setExecutionState(null);
  }, [stopRunWatch]);

  return {
    plan,
    executionState,
    createPlan,
    approvePlan,
    editPlanStep,
    removeStep,
    executePlan,
    continueExecution,
    skipCurrentStep,
    abortExecution,
    resetPlan,
  };
};
