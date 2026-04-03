import type { RefObject } from "react";

import type { ChatMessage } from "../types/chat";

type AIMessageFeedProps = {
  messages: ChatMessage[];
  loading: boolean;
  endRef: RefObject<HTMLDivElement | null>;
  onUseMessage: (content: string) => void;
  onEditMessage: (content: string) => void;
  onHideMessage: (messageId: string) => void;
  onSendCardMessage: (content: string) => void;
  onAddToPipeline: (leadName: string) => void;
};

export const AIMessageFeed = ({
  messages,
  loading,
  endRef,
  onUseMessage,
  onEditMessage,
  onHideMessage,
  onSendCardMessage,
  onAddToPipeline,
}: AIMessageFeedProps) => {
  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-accent/20 bg-surface-secondary/30 p-5 text-sm text-content-secondary">
          <p className="text-base font-medium text-content">👋 Welcome to your AI Sales Engine</p>
          <p className="mt-2">Try one of the quick actions below:</p>
          <p>• Find new leads</p>
          <p>• Get best lead to contact</p>
          <p>• Generate outreach message</p>
        </div>
      ) : null}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[90%] rounded-2xl px-4 py-3 text-[15px] leading-7 transition-all animate-fadeIn ${
              message.role === "assistant"
                ? "border border-accent/25 bg-accent-soft text-content"
                : "border border-accent/15 bg-surface-secondary/70 text-content"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>

            {message.role === "assistant" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onUseMessage(message.content)}
                  className="glass-btn px-2.5 py-1 text-xs"
                >
                  Use this
                </button>
                <button
                  type="button"
                  onClick={() => onEditMessage(message.content)}
                  className="glass-btn px-2.5 py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onHideMessage(message.id)}
                  className="rounded border border-danger/30 bg-danger-soft px-2.5 py-1 text-xs text-danger transition hover:bg-danger/20"
                >
                  Ignore
                </button>
              </div>
            ) : null}

            {message.card ? (
              <div className="mt-3 rounded-xl border border-accent/15 bg-surface-secondary/50 p-3 text-sm">
                <p className="text-[13px] font-semibold text-warning">
                  🔥 Best Lead: {message.card.leadName}
                </p>
                <p className="mt-1 text-xs text-content-secondary">Score: {message.card.score}%</p>
                <p className="text-xs text-content-secondary">Budget: {message.card.budget}</p>
                <div className="mt-2 text-xs text-content-secondary">
                  <p className="font-semibold text-content">Pain:</p>
                  {message.card.pain.map((item) => (
                    <p key={item}>- {item}</p>
                  ))}
                </div>
                <p className="mt-2 text-xs text-success">Suggestion: {message.card.suggestion}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSendCardMessage(message.content)}
                    className="accent-btn px-2.5 py-1 text-xs"
                  >
                    Send Message
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToPipeline(message.card?.leadName || "Lead")}
                    className="glass-btn px-2.5 py-1 text-xs"
                  >
                    Add to Pipeline
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {loading ? (
        <div className="flex justify-start">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3">
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:240ms]" />
          </div>
        </div>
      ) : null}

      <div ref={endRef} />
    </div>
  );
};
