"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { McpServer, ServersResponse } from "@/types/server";
import { Footer } from "@/components/Footer";

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-success";
    case "deprecated":
      return "bg-error";
    default:
      return "bg-text-muted";
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case "active":
      return "text-success";
    case "deprecated":
      return "text-error";
    default:
      return "text-text-muted";
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

export default function HealthPage() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lastSynced, setLastSynced] = useState("");
  const [displayCount, setDisplayCount] = useState(50);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch("/api/servers?limit=100&sort=updated&order=desc");
        if (response.ok) {
          const data: ServersResponse = await response.json();
          setServers(data.servers);
          setTotal(data.total);
          setLastSynced(data.lastSynced);
        }
      } catch {
        console.error("Failed to fetch servers");
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, []);

  const activeCount = servers.filter((s) => s.status === "active").length;
  const deprecatedCount = servers.filter((s) => s.status === "deprecated").length;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/servers?limit=50&sort=updated&order=desc&page=${Math.ceil(displayCount / 50) + 1}`
      );
      if (response.ok) {
        const data: ServersResponse = await response.json();
        setServers((prev) => [...prev, ...data.servers]);
        setDisplayCount((prev) => prev + 50);
      }
    } catch {
      console.error("Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

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
        <div className="max-w-content mx-auto px-5 md:px-8 py-8 animate-fade-in">
          <h1 className="text-xl font-semibold tracking-tighter text-text-primary">
            Health
          </h1>
          <p className="text-[13px] text-text-secondary mt-1">
            Live status from the MCP Registry
          </p>

          {!loading && servers.length > 0 && (
            <div className="mt-6 text-[13px] font-medium">
              <span className="text-success">{activeCount} active</span>
              <span className="text-text-muted"> · </span>
              <span className="text-warning">{deprecatedCount} deprecated</span>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] font-medium uppercase tracking-widest text-text-muted pb-3 pr-4">
                    Name
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-widest text-text-muted pb-3 pr-4">
                    Namespace
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-widest text-text-muted pb-3 pr-4">
                    Transport
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-widest text-text-muted pb-3 pr-4">
                    Status
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase tracking-widest text-text-muted pb-3 pr-4">
                    Version
                  </th>
                  <th className="text-right text-[11px] font-medium uppercase tracking-widest text-text-muted pb-3">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="py-3.5 pr-4">
                        <div className="h-3 w-32 bg-white/[0.04] rounded animate-shimmer" />
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="h-3 w-40 bg-white/[0.04] rounded animate-shimmer" />
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="h-5 w-12 bg-white/[0.04] rounded-badge animate-shimmer" />
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="h-3 w-16 bg-white/[0.04] rounded animate-shimmer" />
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="h-3 w-12 bg-white/[0.04] rounded animate-shimmer" />
                      </td>
                      <td className="py-3.5">
                        <div className="h-3 w-20 bg-white/[0.04] rounded animate-shimmer ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  servers.slice(0, displayCount).map((server) => (
                    <tr
                      key={server.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-150"
                    >
                      <td className="py-3.5 pr-4">
                        <Link
                          href={`/server/${encodeURIComponent(server.id)}`}
                          className="text-[13px] text-text-primary hover:text-accent-text transition-colors"
                        >
                          {server.name}
                        </Link>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-[13px] text-text-secondary">
                          {server.namespace}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[11px] font-medium text-text-secondary bg-white/[0.04] border border-border uppercase">
                          {getTransport(server)}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${getStatusColor(
                              server.status
                            )}`}
                          />
                          <span
                            className={`text-[13px] capitalize ${getStatusTextColor(
                              server.status
                            )}`}
                          >
                            {server.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="text-[13px] text-text-secondary">
                          {server.version || "—"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="text-[13px] text-text-muted">
                          {getRelativeTime(server.updatedAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && servers.length > displayCount && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-button text-[13px] font-medium text-text-secondary border border-border bg-transparent hover:border-border-hover hover:text-text-primary transition-all duration-150 disabled:opacity-40"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}

          {lastSynced && (
            <div className="mt-6 text-[12px] text-text-muted">
              Last synced: {getRelativeTime(lastSynced)}
            </div>
          )}
        </div>
      </main>

      <Footer total={total} lastSynced={lastSynced} />
    </div>
  );
}
