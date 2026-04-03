export const DashboardSkeleton = () => {
  return (
    <div className="space-y-4 p-6">
      <div className="glass-card animate-pulse p-5">
        <div className="h-4 w-28 rounded bg-surface-secondary" />
        <div className="mt-3 h-8 w-64 rounded bg-surface-secondary" />
        <div className="mt-2 h-3 w-80 rounded bg-surface-secondary" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="glass-card animate-pulse p-4">
            <div className="h-3 w-20 rounded bg-surface-secondary" />
            <div className="mt-3 h-7 w-24 rounded bg-surface-secondary" />
            <div className="mt-2 h-3 w-32 rounded bg-surface-secondary" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card h-72 animate-pulse" />
        <div className="glass-card h-72 animate-pulse" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card h-72 animate-pulse" />
        <div className="glass-card h-72 animate-pulse" />
      </div>
    </div>
  );
};
