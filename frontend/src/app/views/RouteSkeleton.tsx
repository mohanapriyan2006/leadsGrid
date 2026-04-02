export const RouteSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-accent/10" />
      <div className="h-24 animate-pulse glass-card" />
      <div className="h-40 animate-pulse glass-card" />
    </div>
  );
};
