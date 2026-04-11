type LeadsDiscoverySearchBarProps = {
  value: string;
  isFetching: boolean;
  onChange: (value: string) => void;
  onFind: () => void;
};

export const LeadsDiscoverySearchBar = ({ value, isFetching, onChange, onFind }: LeadsDiscoverySearchBarProps) => {
  const canFind = value.trim().length > 2 && !isFetching;

  return (
    <div className="glass-card-sm p-3">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-content-tertiary">
          Search Intent Signals
        </label>
        <span className="text-[11px] text-content-tertiary">Live API</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            className="glass-input h-11 w-full pl-10 pr-10"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Try: need crm automation for startup"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>

          {isFetching ? (
            <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
          ) : null}
        </div>

        <button
          type="button"
          onClick={onFind}
          disabled={!canFind}
          className="accent-btn h-11 px-4 text-xs font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? "Finding..." : "Find Leads"}
        </button>
      </div>
    </div>
  );
};
