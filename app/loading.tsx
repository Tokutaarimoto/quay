import { SkeletonCard } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 h-14 flex items-center bg-transparent">
        <div className="max-w-content mx-auto px-5 md:px-8 w-full flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[15px] font-semibold tracking-tighter text-text-primary">
              Quay
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-success/50" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[420px] h-9 bg-transparent border border-border rounded-button" />
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="h-3 w-16 bg-white/[0.04] rounded animate-shimmer" />
            <span className="w-px h-4 bg-border" />
            <div className="h-3 w-12 bg-white/[0.04] rounded animate-shimmer" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-content mx-auto px-5 md:px-8 py-8">
          <div className="flex gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-20 bg-white/[0.04] rounded-badge animate-shimmer"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
