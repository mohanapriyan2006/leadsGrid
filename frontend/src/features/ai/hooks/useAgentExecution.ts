import { useState, useCallback, useRef } from "react";

import type { Lead } from "../../leads/types/lead";
import type { AgentPlan, AgentStep, AgentExecutionState, AIStatus } from "../types/agent";
import { agentService } from "../services/agentService";
import type { AgentActionResult } from "../services/agentService";
import { createId } from "../constants/aiPage";

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
  const abortRef = useRef(false);

  const createPlan = useCallback(
    async (prompt: string, leads: Lead[]): Promise<AgentPlan> => {
      const steps = await agentService.buildPlanFromApi(prompt, leads);
      const newPlan: AgentPlan = {
        id: createId(),
        title: prompt.slice(0, 80),
        steps,
        createdAt: new Date().toISOString(),
        approved: false,
        approvalMode: null,
      };
      setPlan(newPlan);
      return newPlan;
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

      abortRef.current = false;
      callbacks.onStatusChange("executing");

      const state: AgentExecutionState = {
        planId: currentPlan.id,
        currentStepIndex: 0,
        isRunning: true,
        isPaused: false,
        completedSteps: 0,
        totalSteps: currentPlan.steps.length,
        startedAt: new Date().toISOString(),
      };
      setExecutionState(state);

      const updatedSteps = [...currentPlan.steps];

      for (let i = 0; i < updatedSteps.length; i++) {
        if (abortRef.current) break;

        const step = updatedSteps[i];

        if (
          currentPlan.approvalMode === "step_by_step" &&
          !(autoApproveLowRisk && step.riskLevel === "low")
        ) {
          setExecutionState((prev) =>
            prev ? { ...prev, currentStepIndex: i, isPaused: true } : prev,
          );
          return;
        }

        updatedSteps[i] = { ...step, status: "running" };
        setPlan((prev) =>
          prev ? { ...prev, steps: [...updatedSteps] } : prev,
        );
        callbacks.onStepStart(step, i);

        setExecutionState((prev) =>
          prev ? { ...prev, currentStepIndex: i, isPaused: false } : prev,
        );

        try {
          const result = await agentService.executeAction(
            step.actionType,
            leads,
            prompt,
            tone,
          );

          updatedSteps[i] = {
            ...step,
            status: result.success ? "completed" : "failed",
            result: result.message,
            error: result.success ? undefined : result.message,
          };

          setPlan((prev) =>
            prev ? { ...prev, steps: [...updatedSteps] } : prev,
          );

          setExecutionState((prev) =>
            prev
              ? { ...prev, completedSteps: (prev.completedSteps || 0) + 1 }
              : prev,
          );

          callbacks.onStepComplete(updatedSteps[i], i, result);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          updatedSteps[i] = { ...step, status: "failed", error: errorMsg };
          setPlan((prev) =>
            prev ? { ...prev, steps: [...updatedSteps] } : prev,
          );
          callbacks.onStepFail(updatedSteps[i], i, errorMsg);
        }
      }

      setExecutionState((prev) =>
        prev
          ? {
              ...prev,
              isRunning: false,
              completedAt: new Date().toISOString(),
            }
          : prev,
      );

      callbacks.onStatusChange("idle");

      const finalPlan: AgentPlan = { ...currentPlan, steps: updatedSteps };
      setPlan(finalPlan);
      callbacks.onPlanComplete(finalPlan);
    },
    [callbacks],
  );

  const continueExecution = useCallback(
    async (leads: Lead[], prompt: string, tone: string, autoApproveLowRisk: boolean) => {
      if (!plan || !executionState) return;

      const nextIndex = executionState.currentStepIndex;
      const step = plan.steps[nextIndex];
      if (!step) return;

      callbacks.onStatusChange("executing");

      const updatedSteps = [...plan.steps];
      updatedSteps[nextIndex] = { ...step, status: "running" };
      const updatedPlan = { ...plan, steps: updatedSteps };
      setPlan(updatedPlan);
      callbacks.onStepStart(step, nextIndex);

      try {
        const result = await agentService.executeAction(
          step.actionType,
          leads,
          prompt,
          tone,
        );

        updatedSteps[nextIndex] = {
          ...step,
          status: result.success ? "completed" : "failed",
          result: result.message,
          error: result.success ? undefined : result.message,
        };
        setPlan((prev) => (prev ? { ...prev, steps: [...updatedSteps] } : prev));

        setExecutionState((prev) =>
          prev
            ? { ...prev, completedSteps: prev.completedSteps + 1, currentStepIndex: nextIndex + 1 }
            : prev,
        );

        callbacks.onStepComplete(updatedSteps[nextIndex], nextIndex, result);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        updatedSteps[nextIndex] = { ...step, status: "failed", error: errorMsg };
        setPlan((prev) => (prev ? { ...prev, steps: [...updatedSteps] } : prev));
        callbacks.onStepFail(updatedSteps[nextIndex], nextIndex, errorMsg);
      }

      if (nextIndex + 1 < plan.steps.length) {
        const remainingPlan: AgentPlan = {
          ...plan,
          steps: updatedSteps,
          approvalMode: plan.approvalMode,
        };
        await executePlan(remainingPlan, leads, prompt, tone, autoApproveLowRisk);
      } else {
        setExecutionState((prev) =>
          prev ? { ...prev, isRunning: false, completedAt: new Date().toISOString() } : prev,
        );
        callbacks.onStatusChange("idle");
        callbacks.onPlanComplete({ ...plan, steps: updatedSteps });
      }
    },
    [plan, executionState, callbacks, executePlan],
  );

  const abortExecution = useCallback(() => {
    abortRef.current = true;
    setExecutionState((prev) =>
      prev ? { ...prev, isRunning: false, isPaused: false } : prev,
    );
    callbacks.onStatusChange("idle");
  }, [callbacks]);

  const resetPlan = useCallback(() => {
    setPlan(null);
    setExecutionState(null);
  }, []);

  return {
    plan,
    executionState,
    createPlan,
    approvePlan,
    editPlanStep,
    removeStep,
    executePlan,
    continueExecution,
    abortExecution,
    resetPlan,
  };
};
