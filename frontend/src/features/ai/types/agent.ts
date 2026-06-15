export type AIMode = "ask" | "agent";

export type AIStatus = "idle" | "thinking" | "executing";

export type AgentActionType =
  | "lead_discovery"
  | "lead_scoring"
  | "crm_update"
  | "message_draft"
  | "follow_up_schedule";

export type AgentStepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export type AgentRunStatus = "running" | "paused" | "completed" | "failed" | "aborted";

export type RiskLevel = "low" | "medium" | "high";

export type AgentStepEvaluation = {
  score: number;
  quality: "excellent" | "good" | "needs_improvement";
  issues: string[];
  improvement?: string | null;
};

export type AgentStep = {
  id: string;
  label: string;
  description: string;
  actionType: AgentActionType;
  status: AgentStepStatus;
  riskLevel: RiskLevel;
  result?: string;
  error?: string;
  evaluation?: AgentStepEvaluation;
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
  runId: string;
  planId: string;
  status: AgentRunStatus;
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

export type AgentCardType =
  | "discovery_overview"
  | "crm_form"
  | "message_draft"
  | "recycle_bin_action"
  | "confirmation"
  | "lead_select"
  | "agent_form"
  | "lead_picker";

export type AgentActionButton = {
  label: string;
  action: string;
  payload?: Record<string, unknown>;
  style?: "primary" | "secondary" | "danger";
};

export type AgentCardData = {
  type: AgentCardType;
  title: string;
  description: string;
  data: Record<string, unknown>;
  actions: AgentActionButton[];
  requires_confirmation?: boolean;
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "agent";
  content: string;
  messageType: "text" | "plan" | "execution" | "result" | "insight" | "action" | "permission";
  plan?: AgentPlan;
  executionState?: AgentExecutionState;
  card?: import("./chat").InsightCard;
  agentCard?: AgentCardData;
  hidden?: boolean;
  timestamp: string;
};
