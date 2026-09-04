import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { McpServer } from "@/types/server";
import { CodeBlock } from "@/components/CodeBlock";
import { CopyButton } from "@/components/CopyButton";
import { Footer } from "@/components/Footer";
import { ReviewsSection } from "@/components/ReviewsSection";
import { UptimeSection } from "@/components/UptimeSection";
import { WorksInSection } from "@/components/WorksInSection";
import { InspectorSection } from "@/components/InspectorSection";
import { ScoreBadges } from "@/components/ScoreBadges";

interface DbServer {
  id: string;
  name: string;
  namespace: string;
  description: string;
  repository_url: string;
  version: string;
  packages: string;
  status: string;
  category: string;
  health_score: number;
  compliance_score: number;
  stars: number;
  downloads: number;
  published_at: string | null;
  updated_at: string | null;
  is_latest: number;
}

function mapServer(row: DbServer): McpServer {
  let packages;
  try {
    packages = JSON.parse(row.packages);
  } catch {
    packages = [];
  }

  return {
    id: row.id,
    name: row.name,
    namespace: row.namespace,
    description: row.description,
    repositoryUrl: row.repository_url,
    version: row.version,
    packages,
    status: row.status,
    category: row.category || "other",
    healthScore: row.health_score || 50,
    complianceScore: row.compliance_score || 0,
    stars: row.stars || 0,
    downloads: row.downloads || 0,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    isLatest: row.is_latest === 1,
  };
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

function formatDate(dateString: string | null) {
  if (!dateString) return "unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return "bg-success/10 text-success border-success/20";
    case "deprecated":
      return "bg-error/10 text-error border-error/20";
    default:
      return "bg-white/[0.04] text-text-secondary border-border";
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

function getNpmPackage(server: McpServer): string | null {
  if (server.packages && server.packages.length > 0) {
    const npmPackage = server.packages.find(
      (p) => p.registryType === "npm"
    );
    if (npmPackage) {
      return npmPackage.identifier;
    }
  }
  return null;
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    database: "Database",
    filesystem: "Filesystem",
    cloud: "Cloud",
    development: "Development",
    communication: "Communication",
    media: "Media",
    productivity: "Productivity",
    security: "Security",
    web: "Web",
    ai: "AI/ML",
    other: "Other",
  };
  return labels[category] || category;
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  try {
    const db = getDb();
    const server = db.prepare("SELECT * FROM servers WHERE id = ?").get(id) as DbServer | undefined;
    if (!server) {
      return { title: "Server Not Found — Quay" };
    }
    return {
      title: `${server.name} — Quay`,
      description: server.description?.substring(0, 160) || `MCP Server: ${server.name}`,
      openGraph: {
        title: `${server.name} — Quay`,
        description: server.description?.substring(0, 160) || `MCP Server: ${server.name}`,
      },
    };
  } catch {
    return { title: "Quay — MCP Server Registry" };
  }
}

export default function ServerPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);

  let db;
  try {
    db = getDb();
  } catch {
    notFound();
  }

  const serverRow = db
    .prepare("SELECT * FROM servers WHERE id = ?")
    .get(id) as DbServer | undefined;

  if (!serverRow) {
    notFound();
  }

  const server = mapServer(serverRow);
  const transport = getTransport(server);
  const npmPackage = getNpmPackage(server);

  const installCommand = npmPackage ? `npx -y ${npmPackage}` : null;

  const configSnippet = JSON.stringify(
    {
      mcpServers: {
        [server.name]: {
          command: "npx",
          args: ["-y", npmPackage || server.id],
        },
      },
    },
    null,
    2
  );

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

      <main className="flex-1">
        <div className="max-w-[720px] mx-auto px-5 md:px-8 py-8 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All servers
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold tracking-tighter text-text-primary">
              {server.name}
            </h1>
            <span className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`} />
          </div>

          <div className="flex items-center gap-2 text-[13px] text-text-secondary mt-2">
            <span>{server.namespace}</span>
            <span>·</span>
            <span>v{server.version}</span>
            <span>·</span>
            <span>Updated {getRelativeTime(server.updatedAt)}</span>
          </div>

          <div className="mt-4">
            <ScoreBadges
              healthScore={server.healthScore}
              complianceScore={server.complianceScore}
              category={server.category}
            />
          </div>

          {server.description && (
            <p className="text-[15px] text-text-primary leading-[1.7] mt-6">
              {server.description}
            </p>
          )}

          <div className="border-t border-border my-8" />

          {installCommand && (
            <div className="mb-6">
              <div className="text-[12px] font-medium uppercase tracking-widest text-text-secondary mb-2">
                Quick Install
              </div>
              <div className="relative group">
                <pre className="code-block pr-10">
                  <code>{installCommand}</code>
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={installCommand} />
                </div>
              </div>
            </div>
          )}

          {server.repositoryUrl && server.repositoryUrl.includes("github.com") && (
            <a
              href={server.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button text-[13px] font-medium text-text-primary border border-border bg-transparent hover:border-border-hover hover:bg-white/[0.02] transition-all duration-150 mb-6"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Transport</div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[12px] font-medium text-text-secondary bg-white/[0.04] border border-border uppercase">
                {transport}
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Status</div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-badge text-[12px] font-medium border ${getStatusBadge(server.status)}`}>
                {server.status}
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Category</div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[12px] font-medium text-text-secondary bg-white/[0.04] border border-border">
                {getCategoryLabel(server.category)}
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Published</div>
              <span className="text-[13px] text-text-primary">{formatDate(server.publishedAt)}</span>
            </div>
          </div>

          <CodeBlock code={configSnippet} label="Configuration" />

          <div className="mt-8">
            <InspectorSection serverId={server.id} />
          </div>

          <div className="mt-8">
            <UptimeSection serverId={server.id} />
          </div>

          <div className="mt-8">
            <WorksInSection serverId={server.id} />
          </div>

          <div className="mt-8">
            <ReviewsSection serverId={server.id} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
