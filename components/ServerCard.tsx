import Link from "next/link";
import { McpServer } from "@/types/server";

interface ServerCardProps {
  server: McpServer;
  index: number;
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-success shadow-[0_0_6px_rgba(52,211,153,0.35)]";
    case "deprecated":
      return "bg-error";
    default:
      return "bg-text-muted";
  }
}

function getRelativeTime(dateString: string | null) {
  if (!dateString) return "unknown";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function getRepoInfo(repositoryUrl: string) {
  if (!repositoryUrl) {
    return { type: "none" as const };
  }

  if (repositoryUrl.includes("github.com")) {
    const url = new URL(repositoryUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      return {
        type: "github" as const,
        display: `${pathParts[0]}/${pathParts[1]}`,
      };
    }
    return { type: "github" as const, display: repositoryUrl };
  }

  try {
    const url = new URL(repositoryUrl);
    return { type: "other" as const, display: url.hostname };
  } catch {
    return { type: "none" as const };
  }
}

function getTransport(server: McpServer): string {
  if (server.packages && server.packages.length > 0) {
    const transport = server.packages[0]?.transport?.type;
    if (transport) {
      if (transport === "streamable-http") return "http";
      return transport;
    }
  }
  return "stdio";
}

function getHealthBadge(score: number) {
  if (score >= 80) return { color: "text-success", bg: "bg-success/10", border: "border-success/20" };
  if (score >= 60) return { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" };
  return { color: "text-error", bg: "bg-error/10", border: "border-error/20" };
}

export function ServerCard({ server, index }: ServerCardProps) {
  const staggerDelay = Math.min(index, 7) * 40;
  const repoInfo = getRepoInfo(server.repositoryUrl);
  const transport = getTransport(server);
  const healthBadge = getHealthBadge(server.healthScore);

  return (
    <Link
      href={`/server/${encodeURIComponent(server.id)}`}
      className="group relative block bg-surface border border-border rounded-card p-5 transition-colors duration-150 hover:border-border-hover card-stagger"
      style={{ animationDelay: `${staggerDelay}ms` }}
    >
      <div className="absolute top-0 left-5 right-5 h-0.5 bg-accent/40 rounded-b-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-[15px] font-medium tracking-tight text-text-primary truncate">
          {server.name}
        </h3>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${getStatusColor(server.status)}`} />
      </div>

      <p className="text-[13px] text-text-secondary line-clamp-2 mb-4 leading-relaxed">
        {server.description}
      </p>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[11px] font-medium uppercase tracking-wider text-text-secondary bg-white/[0.04] border border-border">
          {transport}
        </span>
        {server.version && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[11px] font-medium text-text-secondary bg-white/[0.04] border border-border">
            v{server.version}
          </span>
        )}
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-badge text-[10px] font-medium ${healthBadge.color} ${healthBadge.bg} border ${healthBadge.border}`}>
          {server.healthScore}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {repoInfo.type === "github" ? (
          <a
            href={server.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors group/link"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="group-hover/link:underline">{repoInfo.display}</span>
          </a>
        ) : repoInfo.type === "other" ? (
          <a
            href={server.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>{repoInfo.display}</span>
          </a>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        )}
        <span className="text-[11px] text-text-muted">
          Updated {getRelativeTime(server.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
