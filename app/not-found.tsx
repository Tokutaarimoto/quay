import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 h-14 flex items-center bg-transparent">
        <div className="max-w-content mx-auto px-5 md:px-8 w-full flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[15px] font-semibold tracking-tighter text-text-primary">
              Quay
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-[48px] font-semibold text-text-muted mb-3">
            404
          </div>
          <p className="text-[14px] text-text-secondary mb-6">
            This server doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] text-accent hover:underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to registry
          </Link>
        </div>
      </main>
    </div>
  );
}
