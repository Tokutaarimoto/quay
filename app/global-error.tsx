"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary font-sans antialiased">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-[15px] text-text-secondary mb-4">
              Something went wrong
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-button text-[13px] font-medium text-accent-text border border-accent/30 bg-transparent hover:bg-accent-subtle transition-colors duration-150"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
