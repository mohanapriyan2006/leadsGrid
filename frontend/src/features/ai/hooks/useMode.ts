import { useState, useCallback } from "react";

import type { AIMode, AIStatus, ActiveContext } from "../types/agent";

export const useMode = () => {
  const [mode, setMode] = useState<AIMode>("ask");
  const [aiStatus, setAIStatus] = useState<AIStatus>("idle");
  const [activeContext, setActiveContext] = useState<ActiveContext>({
    type: "none",
    label: "No context selected",
  });
  const [autoApproveLowRisk, setAutoApproveLowRisk] = useState(false);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "ask" ? "agent" : "ask"));
  }, []);

  const switchToAgent = useCallback(() => setMode("agent"), []);
  const switchToAsk = useCallback(() => setMode("ask"), []);

  return {
    mode,
    setMode,
    toggleMode,
    switchToAgent,
    switchToAsk,
    aiStatus,
    setAIStatus,
    activeContext,
    setActiveContext,
    autoApproveLowRisk,
    setAutoApproveLowRisk,
  };
};
