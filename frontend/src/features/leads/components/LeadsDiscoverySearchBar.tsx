type LeadsDiscoverySearchBarProps = {
  value: string;
  isFetching: boolean;
  onChange: (value: string) => void;
};

export const LeadsDiscoverySearchBar = ({ value, isFetching, onChange }: LeadsDiscoverySearchBarProps) => {
  return (
    <div className="relative">
      <input
        className="glass-input w-full pl-10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search live buyer signals..."
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
  );
};
