export type AIMode = "ask" | "agent";

export type AIStatus = "idle" | "thinking" | "executing";

export type AgentActionType =
  | "lead_discovery"
  | "lead_scoring"
  | "crm_update"
  | "message_draft"
  | "follow_up_schedule";

export type AgentStepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export type RiskLevel = "low" | "medium" | "high";

export type AgentStep = {
  id: string;
  label: string;
  description: string;
  actionType: AgentActionType;
  status: AgentStepStatus;
  riskLevel: RiskLevel;
  result?: string;
  error?: string;
};

export type AgentPlan = {
  id: string;
  title: string;
  steps: AgentStep[];
  createdAt: string;
  approved: boolean;
  approvalMode: "all" | "step_by_step" | null;
};

export type AgentExecutionState = {
  planId: string;
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  completedSteps: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
};

export type ActiveContext = {
  type: "lead" | "pipeline" | "none";
  label: string;
  id?: string;
};

export type SmartSuggestion = {
  id: string;
  label: string;
  prompt: string;
  category: "discovery" | "outreach" | "pipeline" | "analysis";
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "agent";
  content: string;
  messageType: "text" | "plan" | "execution" | "result" | "insight" | "action" | "permission";
  plan?: AgentPlan;
  executionState?: AgentExecutionState;
  card?: import("./chat").InsightCard;
  hidden?: boolean;
  timestamp: string;
};
