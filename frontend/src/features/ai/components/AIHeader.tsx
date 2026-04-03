import type { ChatSession } from "../types/chat";

type AIHeaderProps = {
  historyOpen: boolean;
  chatHistory: ChatSession[];
  messagesCount: number;
  onSaveCurrentChat: () => void;
  onStartNewChat: () => void;
  onToggleHistory: () => void;
  onRestoreChat: (session: ChatSession) => void;
};

export const AIHeader = ({
  historyOpen,
  chatHistory,
  messagesCount,
  onSaveCurrentChat,
  onStartNewChat,
  onToggleHistory,
  onRestoreChat,
}: AIHeaderProps) => {
  return (
    <header className="relative flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h2 className="page-title">AI Sales Engine</h2>
        <p className="page-subtitle">Real-time insights for your pipeline</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSaveCurrentChat}
          disabled={messagesCount === 0}
          className="glass-btn h-9 w-9 items-center justify-center p-0 disabled:cursor-not-allowed disabled:opacity-50"
          title="Save current chat"
          aria-label="Save current chat"
        >
          💾
        </button>
        <button
          type="button"
          onClick={onStartNewChat}
          className="glass-btn h-9 w-9 items-center justify-center p-0"
          title="Start new chat"
          aria-label="Start new chat"
        >
          ➕
        </button>
        <button
          type="button"
          onClick={onToggleHistory}
          className="glass-btn h-9 w-9 items-center justify-center p-0"
          title="Chat history"
          aria-label="Toggle chat history"
        >
          🕘
        </button>
      </div>

      {historyOpen ? (
        <div className="absolute right-0 top-12 z-20 w-full max-w-sm glass-card p-3 md:w-96">
          <p className="text-xs font-semibold uppercase tracking-wider text-content-secondary">
            Recent Chats
          </p>
          <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
            {chatHistory.length > 0 ? (
              chatHistory.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onRestoreChat(session)}
                  className="w-full rounded-xl border border-accent/10 bg-surface-secondary/50 px-3 py-2 text-left transition hover:border-accent/30 hover:bg-surface-secondary/70"
                >
                  <p className="text-sm font-medium text-content">{session.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-content-secondary">{session.preview}</p>
                  <p className="mt-1 text-[11px] text-accent">{session.createdAt}</p>
                </button>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-accent/20 bg-surface-secondary/30 px-3 py-4 text-xs text-content-secondary">
                No saved chats yet. Use the 💾 button to save your current conversation.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};
