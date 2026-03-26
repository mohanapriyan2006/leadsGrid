export const RouteSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
      <div className="h-24 animate-pulse rounded-xl border border-white/10 bg-panel/60" />
      <div className="h-40 animate-pulse rounded-xl border border-white/10 bg-panel/60" />
    </div>
  );
};
