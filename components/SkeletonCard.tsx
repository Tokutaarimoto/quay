export function SkeletonCard({ index }: { index: number }) {
  const staggerDelay = Math.min(index, 7) * 40;

  return (
    <div
      className="bg-surface border border-border rounded-card p-5 card-stagger"
      style={{ animationDelay: `${staggerDelay}ms` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="h-4 w-32 animate-shimmer rounded" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/[0.04] shrink-0 mt-1.5" />
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-3 w-full animate-shimmer rounded" />
        <div className="h-3 w-3/4 animate-shimmer rounded" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-12 animate-shimmer rounded-badge" />
        <div className="h-5 w-14 animate-shimmer rounded-badge" />
      </div>

      <div className="flex items-center justify-between">
        <div className="h-3 w-24 animate-shimmer rounded" />
        <div className="h-3 w-20 animate-shimmer rounded" />
      </div>
    </div>
  );
}
