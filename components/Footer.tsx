function getRelativeTime(dateString: string | null) {
  if (!dateString) return "unknown";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface FooterProps {
  total?: number;
  lastSynced?: string;
}

export function Footer({ total, lastSynced }: FooterProps) {
  return (
    <footer className="mt-16 py-8 border-t border-white/[0.04]">
      <div className="max-w-content mx-auto px-5 md:px-8 text-center">
        <p className="text-[12px] text-text-muted">
          <span className="font-medium text-text-secondary">Quay</span>
          <span> · MCP Server Registry</span>
          {total !== undefined && (
            <span> · {total.toLocaleString()} servers</span>
          )}
          {lastSynced && (
            <span> · Last synced {getRelativeTime(lastSynced)}</span>
          )}
        </p>
      </div>
    </footer>
  );
}
