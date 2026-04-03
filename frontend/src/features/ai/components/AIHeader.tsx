import type { ChatSession } from "../types/chat";
import type { AIMode, AIStatus, ActiveContext } from "../types/agent";
import { ModeToggle } from "./ModeToggle";
import { ContextBar } from "./ContextBar";
import { StatusIndicator } from "./StatusIndicator";

type AIHeaderProps = {
  historyOpen: boolean;
  chatHistory: ChatSession[];
  messagesCount: number;
  mode: AIMode;
  aiStatus: AIStatus;
  activeContext: ActiveContext;
  onSaveCurrentChat: () => void;
  onStartNewChat: () => void;
  onToggleHistory: () => void;
  onRestoreChat: (session: ChatSession) => void;
  onToggleMode: () => void;
};

export const AIHeader = ({
  historyOpen,
  chatHistory,
  messagesCount,
  mode,
  aiStatus,
  activeContext,
  onSaveCurrentChat,
  onStartNewChat,
  onToggleHistory,
  onRestoreChat,
  onToggleMode,
}: AIHeaderProps) => {
  return (
    <header className="relative flex-shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="bg-gradient-to-r from-content via-accent to-accent-secondary bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              AI Sales Engine
            </h2>
            <p className="mt-0.5 text-xs text-content-tertiary">
              {mode === "ask" ? "Ask questions & get insights" : "Agent executes actions for you"}
            </p>
          </div>

          <div className="hidden h-8 w-px bg-accent/10 md:block" />

          <ModeToggle mode={mode} onToggle={onToggleMode} />
        </div>

        <div className="flex items-center gap-1.5">
          <ContextBar context={activeContext} />
          <StatusIndicator status={aiStatus} />

          <div className="ml-1 h-5 w-px bg-accent/10" />

          <button
            type="button"
            onClick={onSaveCurrentChat}
            disabled={messagesCount === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/[0.08] bg-surface-secondary/40 text-sm transition-all hover:border-accent/20 hover:bg-surface-secondary/70 disabled:cursor-not-allowed disabled:opacity-40"
            title="Save current chat"
            aria-label="Save current chat"
          >
            💾
          </button>
          <button
            type="button"
            onClick={onStartNewChat}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/[0.08] bg-surface-secondary/40 text-sm transition-all hover:border-accent/20 hover:bg-surface-secondary/70"
            title="Start new chat"
            aria-label="Start new chat"
          >
            ➕
          </button>
          <button
            type="button"
            onClick={onToggleHistory}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/[0.08] bg-surface-secondary/40 text-sm transition-all hover:border-accent/20 hover:bg-surface-secondary/70"
            title="Chat history"
            aria-label="Toggle chat history"
          >
            🕘
          </button>
        </div>
      </div>

      {historyOpen ? (
        <div className="absolute right-0 top-14 z-30 w-full max-w-sm rounded-xl border border-accent/10 bg-surface-secondary/95 p-3 shadow-glass-lg backdrop-blur-xl md:w-96">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-content-tertiary">
            Recent Chats
          </p>
          <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {chatHistory.length > 0 ? (
              chatHistory.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onRestoreChat(session)}
                  className="w-full rounded-lg border border-accent/[0.06] bg-surface-tertiary/40 px-3 py-2 text-left transition-all hover:border-accent/15 hover:bg-surface-tertiary/70"
                >
                  <p className="text-sm font-medium text-content">{session.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-content-tertiary">{session.preview}</p>
                  <p className="mt-0.5 text-[10px] text-accent/60">{session.createdAt}</p>
                </button>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-accent/10 bg-surface-tertiary/30 px-3 py-4 text-center text-xs text-content-tertiary">
                No saved chats yet.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};
