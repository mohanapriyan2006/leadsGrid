export const Topbar = () => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-ink/60 px-4 py-3 backdrop-blur">
      <input
        type="search"
        placeholder="Search signals or accounts..."
        className="w-full max-w-md rounded-md border border-white/10 bg-panelSoft/70 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
      />
      <div className="ml-4 flex items-center gap-3 text-sm text-text-dim">
        <span>v0.1</span>
        <span className="rounded-full border border-accent/40 px-2 py-1 text-xs text-accent">online</span>
      </div>
    </header>
  );
};
