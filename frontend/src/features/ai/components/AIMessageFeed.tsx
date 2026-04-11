import type { RefObject } from "react";

import type { ChatMessage } from "../types/chat";
import type { AIMode, AgentPlan, AgentExecutionState, SmartSuggestion } from "../types/agent";
import { AgentPlanCard } from "./AgentPlanCard";
import { AgentExecutionTimeline } from "./AgentExecutionTimeline";
import { EmptyState } from "./EmptyState";
import { PermissionModal } from "./PermissionModal";

type AIMessageFeedProps = {
  messages: ChatMessage[];
  loading: boolean;
  mode: AIMode;
  endRef: RefObject<HTMLDivElement | null>;
  suggestions: SmartSuggestion[];
  agentPlan: AgentPlan | null;
  executionState: AgentExecutionState | null;
  onUseMessage: (content: string) => void;
  onEditMessage: (content: string) => void;
  onHideMessage: (messageId: string) => void;
  onSendCardMessage: (content: string) => void;
  onAddToPipeline: (leadName: string) => void;
  onSuggestionClick: (prompt: string) => void;
  onConvertToAgent: (content: string) => void;
  onApproveAll: () => void;
  onApproveStepByStep: () => void;
  onEditStep: (stepId: string, updates: Partial<{ label: string; description: string }>) => void;
  onRemoveStep: (stepId: string) => void;
  onContinueExecution: () => void;
  onSkipExecution: () => void;
  onAbortExecution: () => void;
  autoApproveLowRisk: boolean;
  onToggleAutoApprove: () => void;
};

export const AIMessageFeed = ({
  messages,
  loading,
  mode,
  endRef,
  suggestions,
  agentPlan,
  executionState,
  onUseMessage,
  onEditMessage,
  onHideMessage,
  onSendCardMessage,
  onAddToPipeline,
  onSuggestionClick,
  onConvertToAgent,
  onApproveAll,
  onApproveStepByStep,
  onEditStep,
  onRemoveStep,
  onContinueExecution,
  onSkipExecution,
  onAbortExecution,
  autoApproveLowRisk,
  onToggleAutoApprove,
}: AIMessageFeedProps) => {
  const pausedStep =
    agentPlan && executionState?.isPaused
      ? agentPlan.steps[executionState.currentStepIndex] ?? null
      : null;

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
      {messages.length === 0 && !agentPlan ? (
        <EmptyState
          mode={mode}
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
        />
      ) : null}

      {messages.map((message) => {
        const messageMode = message.mode ?? mode;
        return (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
        >
          <div
            className={`max-w-[82%] text-[14px] leading-relaxed ${
              message.role === "user"
                ? "rounded-2xl rounded-br-md border border-accent/15 bg-accent/[0.08] px-4 py-2.5 text-content"
                : message.role === "agent"
                  ? "rounded-2xl rounded-bl-md border-l-2 border-l-info/70 bg-surface-tertiary/50 px-4 py-2.5 text-content"
                  : "rounded-2xl rounded-bl-md border-l-2 border-l-accent/60 bg-surface-tertiary/50 px-4 py-2.5 text-content"
            }`}
          >
            {message.role === "agent" ? (
              <div>
                <span className="mb-1 inline-block rounded-sm bg-info/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-info/80">
                  Agent
                </span>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}

            {message.role === "assistant" ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {messageMode === "ask" ? (
                  message.offerAgent ? (
                    <button
                      type="button"
                      onClick={() => onConvertToAgent(message.content)}
                      className="rounded-md border border-info/[0.2] bg-info/[0.06] px-2.5 py-1 text-[11px] font-medium text-info/85 transition-all hover:bg-info/[0.12]"
                    >
                      Run in Agent mode
                    </button>
                  ) : null
                ) : null}
              </div>
            ) : null}

            {message.card && messageMode !== "ask" ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-warning/[0.12] bg-surface/60">
                <div className="border-b border-warning/[0.08] bg-warning/[0.04] px-3.5 py-2">
                  <p className="text-[13px] font-semibold text-warning">
                    🔥 Best Lead: {message.card.leadName}
                  </p>
                </div>
                <div className="space-y-2 px-3.5 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-content-tertiary">Score</span>
                      <span className="text-sm font-bold text-accent">{message.card.score}%</span>
                    </div>
                    <div className="h-3 w-px bg-accent/10" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-content-tertiary">Budget</span>
                      <span className="text-sm font-medium text-content">{message.card.budget}</span>
                    </div>
                  </div>
                  <div className="text-xs text-content-secondary">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-content-tertiary">Pain Points</p>
                    {message.card.pain.map((item) => (
                      <p key={item} className="flex items-start gap-1.5 py-0.5">
                        <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-warning/50" />
                        {item}
                      </p>
                    ))}
                  </div>
                  <p className="rounded-lg bg-success/[0.06] px-2.5 py-1.5 text-xs text-success">
                    {message.card.suggestion}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onSendCardMessage(message.content)}
                      className="accent-btn px-3 py-1.5 text-[11px]"
                    >
                      Send Message
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToPipeline(message.card?.leadName || "Lead")}
                      className="rounded-md border border-accent/[0.08] bg-surface-secondary/50 px-3 py-1.5 text-[11px] font-medium text-content-secondary transition-all hover:border-accent/20 hover:text-content"
                    >
                      Add to Pipeline
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        );
      })}

      {agentPlan && !executionState ? (
        <AgentPlanCard
          plan={agentPlan}
          onApproveAll={onApproveAll}
          onApproveStepByStep={onApproveStepByStep}
          onEditStep={onEditStep}
          onRemoveStep={onRemoveStep}
        />
      ) : null}

      {agentPlan && executionState ? (
        <AgentExecutionTimeline
          plan={agentPlan}
          executionState={executionState}
          onContinue={onContinueExecution}
          onAbort={onAbortExecution}
        />
      ) : null}

      {pausedStep ? (
        <PermissionModal
          step={pausedStep}
          onApprove={onContinueExecution}
          onSkip={onSkipExecution}
          onAbort={onAbortExecution}
          autoApproveLowRisk={autoApproveLowRisk}
          onToggleAutoApprove={onToggleAutoApprove}
        />
      ) : null}

      {loading ? (
        <div className="flex items-start justify-start">
          <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border-l-2 border-l-accent/60 bg-surface-tertiary/50 px-4 py-3">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/60 [animation-delay:300ms]" />
          </div>
        </div>
      ) : null}

      <div ref={endRef} />
    </div>
  );
};
