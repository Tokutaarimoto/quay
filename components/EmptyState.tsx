"use client";

interface EmptyStateProps {
  type: "search" | "error";
  onClear?: () => void;
  onRetry?: () => void;
}

export function EmptyState({ type, onClear, onRetry }: EmptyStateProps) {
  if (type === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <svg
          className="w-10 h-10 text-text-muted mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
          />
        </svg>
        <p className="text-[15px] text-text-secondary mb-1">
          Failed to load servers
        </p>
        <p className="text-[13px] text-text-muted mb-4">
          The registry may be temporarily unavailable.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-button text-[13px] font-medium text-accent-text border border-accent/30 bg-transparent hover:bg-accent-subtle transition-colors duration-150"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg
        className="w-10 h-10 text-text-muted mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10 10l4 4m0-4l-4 4"
        />
      </svg>
      <p className="text-[15px] text-text-secondary mb-1">
        No servers match your search
      </p>
      <p className="text-[13px] text-text-muted mb-4">
        Try a different term or clear the search
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="text-[13px] text-accent hover:underline transition-colors duration-150"
        >
          Clear search
        </button>
      )}
    </div>
  );
}
