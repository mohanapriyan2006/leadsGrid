import { useAuth } from "../../features/auth/AuthContext";

export const Topbar = () => {
  const { user, signOut } = useAuth();
  
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
        <div className="flex items-center gap-2 group relative">
          <button className="h-8 w-8 rounded-full overflow-hidden border border-white/10 bg-black/20 text-xs text-text-dim transition hover:text-white" aria-label="Profile">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              "◎"
            )}
          </button>
          <button 
            onClick={signOut}
            className="absolute top-10 right-0 hidden group-hover:block whitespace-nowrap bg-neutral-800 text-white px-3 py-1 rounded shadow-lg border border-neutral-700 hover:bg-neutral-700"
          >
            Sign Out
          </button>
        </div>
        <span>v0.2</span>
        <span className="rounded-full border border-accent/40 px-2 py-1 text-xs text-accent">online</span>
      </div>
    </header>
  );
};
