"use client";

import { useState, useEffect, useCallback } from "react";
import { McpServer, ServersResponse } from "@/types/server";
import { TopBar, SearchProvider, useSearch } from "@/components/TopBar";
import { FilterPills } from "@/components/FilterPills";
import { ServerGrid } from "@/components/ServerGrid";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { Footer } from "@/components/Footer";

function RecentlyUpdated({ servers }: { servers: McpServer[] }) {
  if (servers.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xs font-medium text-text-secondary mb-3">
        Recently Updated
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {servers.map((server) => (
          <a
            key={server.id}
            href={`/server/${encodeURIComponent(server.id)}`}
            className="flex-shrink-0 w-[200px] bg-surface border border-border rounded-card p-4 transition-colors duration-150 hover:border-border-hover"
          >
            <h3 className="text-[14px] font-medium text-text-primary truncate mb-1">
              {server.name}
            </h3>
            <p className="text-[12px] text-text-secondary line-clamp-1 mb-2">
              {server.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase text-text-muted bg-white/[0.04] border border-border">
                {server.packages?.[0]?.transport?.type || "stdio"}
              </span>
              {server.healthScore >= 80 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-success bg-success/10 border border-success/20">
                  Healthy
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      <span className="text-xs text-text-muted">
        Page {page} of {totalPages.toLocaleString()}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-4 py-2 rounded-button text-[13px] font-medium text-text-secondary border border-border bg-transparent hover:border-border-hover hover:text-text-primary transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-button text-[13px] font-medium text-text-secondary border border-border bg-transparent hover:border-border-hover hover:text-text-primary transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function CategoryFilter({
  activeCategory,
  onChange,
}: {
  activeCategory: string;
  onChange: (cat: string) => void;
}) {
  const categories = [
    "all", "database", "development", "cloud", "productivity",
    "communication", "ai", "web", "media", "security", "filesystem", "other"
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === "all" ? "" : cat)}
          className={`h-7 px-3 rounded-badge text-xs font-medium whitespace-nowrap transition-all duration-150 ${
            (cat === "all" && activeCategory === "") || activeCategory === cat
              ? "bg-accent-subtle text-accent-text border border-accent-border"
              : "bg-transparent text-text-secondary border border-transparent hover:bg-white/[0.04] hover:text-text-primary"
          }`}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  );
}

function HomePageContent() {
  const { search, transport, page, setPage, setTransport } = useSearch();
  const [servers, setServers] = useState<McpServer[]>([]);
  const [recentServers, setRecentServers] = useState<McpServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [lastSynced, setLastSynced] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("updated");

  const fetchServers = useCallback(
    async (pageNum: number, searchTerm: string, transportFilter: string, cat: string, sort: string) => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams();
        params.set("page", pageNum.toString());
        params.set("limit", "24");
        if (searchTerm) params.set("search", searchTerm);
        if (transportFilter) params.set("transport", transportFilter);
        params.set("sort", sort);
        params.set("order", "desc");

        const response = await fetch(`/api/servers?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data: ServersResponse = await response.json();

        let filtered = data.servers;
        if (cat) {
          filtered = filtered.filter((s) => s.category === cat);
        }

        setServers(filtered);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLastSynced(data.lastSynced);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchRecent = useCallback(async () => {
    try {
      const response = await fetch("/api/servers?limit=6&sort=updated&order=desc");
      if (response.ok) {
        const data: ServersResponse = await response.json();
        setRecentServers(data.servers);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchServers(page, search, transport, category, sortBy);
  }, [page, search, transport, category, sortBy, fetchServers]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTransport = params.get("transport") || "";
    const urlPage = parseInt(params.get("page") || "1", 10);
    const urlCategory = params.get("category") || "";
    const urlSort = params.get("sort") || "updated";

    if (urlTransport) setTransport(urlTransport);
    if (urlCategory) setCategory(urlCategory);
    if (urlSort) setSortBy(urlSort);
    if (urlPage > 1) setPage(urlPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTransportChange = (newTransport: string) => {
    setTransport(newTransport);
    setPage(1);
    updateUrl({ transport: newTransport, page: "1" });
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
    updateUrl({ category: newCategory, page: "1" });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
    updateUrl({ sort: newSort, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "1" && value !== "updated") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar serverCount={total} />

      <main className="flex-1">
        <div className="max-w-content mx-auto px-5 md:px-8 py-8 animate-fade-in">
          <FilterPills activeTransport={transport} onChange={handleTransportChange} />

          <CategoryFilter activeCategory={category} onChange={handleCategoryChange} />

          <div className="flex items-center justify-between mb-4">
            <div className="text-[12px] text-text-muted">
              {total.toLocaleString()} servers
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-2 py-1 rounded-badge bg-surface border border-border text-[12px] text-text-secondary focus:border-accent/40 focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Name</option>
              <option value="published">Recently Published</option>
            </select>
          </div>

          {!loading && recentServers.length > 0 && !search && !transport && !category && (
            <RecentlyUpdated servers={recentServers} />
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState type="error" onRetry={() => fetchServers(page, search, transport, category, sortBy)} />
          ) : servers.length > 0 ? (
            <>
              <ServerGrid servers={servers} />
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <EmptyState
              type="search"
              onClear={() => {
                setTransport("");
                setCategory("");
                setPage(1);
                window.history.replaceState({}, "", window.location.pathname);
              }}
            />
          )}
        </div>
      </main>

      <Footer total={total} lastSynced={lastSynced} />
    </div>
  );
}

export default function Home() {
  return (
    <SearchProvider>
      <HomePageContent />
    </SearchProvider>
  );
}
