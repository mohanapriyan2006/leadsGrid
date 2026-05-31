import type { ReactNode } from "react";
import { Plus, History } from "lucide-react";

import type { ChatSession } from "../types/chat";
import type { AIMode, AIStatus, ActiveContext } from "../types/agent";
import { ModeToggle } from "./ModeToggle";

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
  utilityControl?: ReactNode;
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
  utilityControl,
}: AIHeaderProps) => {
  const contextLabel =
    activeContext.type === "none" ? "No context" : activeContext.label;

  return (
    <header className="relative flex-shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-content">
              AI Sales Engine
            </h2>
            <p className="mt-0.5 text-xs  ">
              {mode === "ask"
                ? "Ask anything about leads, pipeline, or outreach"
                : "Tell the agent what to do. It will plan and execute."}
            </p>
          </div>

          <div className="hidden h-8 w-px bg-accent/10 md:block" />

          <ModeToggle mode={mode} onToggle={onToggleMode} />
        </div>

        <div className="flex items-center gap-2">
          {utilityControl}

          <button
            type="button"
            onClick={onStartNewChat}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-secondary/40 text-sm text-content-secondary transition-all hover:bg-surface-secondary/70 hover:text-content"
            title="Start new chat"
            aria-label="Start new chat"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleHistory}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-secondary/40 text-sm text-content-secondary transition-all hover:bg-surface-secondary/70 hover:text-content"
            title="Chat history"
            aria-label="Toggle chat history"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {historyOpen ? (
        <div className="absolute right-0 top-14 z-30 w-full max-w-sm rounded-xl border border-accent/10 bg-surface-secondary/95 p-3 shadow-glass md:w-96">
          <p className="text-[10px] font-semibold uppercase tracking-widest  ">
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
                  <p className="mt-0.5 line-clamp-1 text-[11px]  ">{session.preview}</p>
                  <p className="mt-0.5 text-[10px] text-accent/60">{session.createdAt}</p>
                </button>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-accent/10 bg-surface-tertiary/30 px-3 py-4 text-center text-xs  ">
                No saved chats yet.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};
