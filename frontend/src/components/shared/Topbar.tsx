export const Topbar = () => {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/10 bg-ink/70 px-4 py-3 backdrop-blur">
      <input
        type="search"
        placeholder="Search signals or accounts..."
        className="w-full max-w-md rounded-md border border-white/10 bg-panelSoft/70 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
      />
      <div className="ml-auto flex items-center gap-2 text-sm text-text-dim">
        <button className="h-8 w-8 rounded border border-white/10 bg-black/20 text-xs text-text-dim transition hover:text-white" aria-label="Notifications">
          🔔
        </button>
        <button className="h-8 w-8 rounded border border-white/10 bg-black/20 text-xs text-text-dim transition hover:text-white" aria-label="Profile">
          ◎
        </button>
        <span>v0.2</span>
        <span className="rounded-full border border-accent/40 px-2 py-1 text-xs text-accent">online</span>
      </div>
    </header>
  );
};
