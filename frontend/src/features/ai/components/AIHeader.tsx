import { useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from "react";
import { Plus, History, Pencil, Trash2, MessageSquare } from "lucide-react";

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
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  onToggleMode: () => void;
  utilityControl?: ReactNode;
};

export const AIHeader = ({
  historyOpen,
  chatHistory,
  mode,
  activeContext,
  onStartNewChat,
  onToggleHistory,
  onRestoreChat,
  onRenameChat,
  onDeleteChat,
  onToggleMode,
  utilityControl,
}: AIHeaderProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setEditingValue(session.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const commitEditing = () => {
    if (editingId && editingValue.trim()) {
      onRenameChat(editingId, editingValue.trim());
    }
    setEditingId(null);
    setEditingValue("");
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commitEditing();
    if (event.key === "Escape") cancelEditing();
  };

  return (
    <header className="relative flex-shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-content">
              AI Sales Engine
            </h2>
            <p className="mt-0.5 text-xs text-content-secondary">
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
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${historyOpen ? "bg-accent/15 text-accent" : "bg-surface-secondary/40 text-content-secondary hover:bg-surface-secondary/70 hover:text-content"}`}
            title="Chat history"
            aria-label="Toggle chat history"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {historyOpen ? (
        <div className="absolute right-0 top-14 z-30 w-full max-w-sm rounded-2xl border border-accent/[0.1] bg-surface-secondary/98 p-3 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:w-96 animate-fadeIn">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-content-secondary">
              <MessageSquare className="h-3 w-3" />
              Recent Chats
            </p>
            <span className="text-[10px] text-content-tertiary/60">{chatHistory.length} saved</span>
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto pr-1 scrollbar-thin">
            {chatHistory.length > 0 ? (
              chatHistory.map((session) => (
                <div
                  key={session.id}
                  className="group relative flex items-start gap-2 rounded-xl border border-transparent bg-surface-tertiary/30 px-3 py-2.5 transition-all hover:border-accent/[0.08] hover:bg-surface-tertiary/60"
                >
                  {editingId === session.id ? (
                    <input
                      ref={inputRef}
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={commitEditing}
                      className="flex-1 w-full rounded-md border border-accent/20 bg-surface/70 px-2 py-1 text-sm font-medium text-content outline-none focus:border-accent/50"
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onRestoreChat(session)}
                        className="flex-1 text-left"
                      >
                        <p className="text-sm font-medium text-content line-clamp-1">{session.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-content-secondary/70">{session.preview}</p>
                        <p className="mt-0.5 text-[10px] text-accent/50">{session.createdAt}</p>
                      </button>

                      <div className="flex items-center gap-0.5 pt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(session);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary transition-all hover:bg-accent/10 hover:text-accent"
                          title="Rename"
                          aria-label="Rename chat"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(session.id);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary transition-all hover:bg-danger/10 hover:text-danger"
                          title="Delete"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-accent/10 bg-surface-tertiary/20 px-3 py-6">
                <MessageSquare className="mb-2 h-5 w-5 text-content-tertiary/40" />
                <p className="text-xs text-content-secondary/60">No saved chats yet.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};
