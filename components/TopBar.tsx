"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { Info } from "lucide-react";
import { McpInfoModal } from "./McpInfoModal";

interface SearchContextType {
  search: string;
  setSearch: (value: string) => void;
  transport: string;
  setTransport: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
}

const SearchContext = createContext<SearchContextType>({
  search: "",
  setSearch: () => {},
  transport: "",
  setTransport: () => {},
  page: 1,
  setPage: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");
  const [transport, setTransport] = useState("");
  const [page, setPage] = useState(1);

  return (
    <SearchContext.Provider
      value={{ search, setSearch, transport, setTransport, page, setPage }}
    >
      {children}
    </SearchContext.Provider>
  );
}

function TopBarSearch() {
  const { search, setSearch, setPage } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement !== inputRef.current &&
        !(document.activeElement instanceof HTMLInputElement) &&
        !(document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        params.delete("page");
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}?${params.toString()}`
        );
      }, 300);
    },
    [setSearch, setPage]
  );

  return (
    <div className="relative w-full max-w-[420px]">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search servers..."
        className="w-full h-9 bg-transparent border border-border rounded-button pl-9 pr-12 text-[13px] text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-accent/40 focus:outline-none"
      />
      {!focused && !search && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-muted font-mono px-1.5 py-0.5 border border-border rounded-badge bg-white/[0.04] transition-opacity duration-150 pointer-events-none">
          /
        </span>
      )}
    </div>
  );
}

interface TopBarProps {
  serverCount?: number;
}

export function TopBar({ serverCount }: TopBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        id="topbar"
        className={`sticky top-0 z-50 h-14 flex items-center transition-all duration-150 ${
          scrolled
            ? "bg-[rgba(10,10,11,0.85)] backdrop-blur-xl border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-content mx-auto px-5 md:px-8 w-full flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-[15px] font-semibold tracking-tighter text-text-primary">
              Quay
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          </Link>

          <button
            onClick={() => setShowInfoModal(true)}
            className="text-text-muted hover:text-text-secondary transition-colors shrink-0"
          >
            <Info size={14} />
          </button>

        <div className="flex-1 flex justify-center">
          <TopBarSearch />
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {serverCount !== undefined && (
            <>
              <span className="text-xs text-text-muted">
                {serverCount.toLocaleString()} servers
              </span>
              <span className="w-px h-4 bg-border" />
            </>
          )}
          <Link
            href="/health"
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            /health
          </Link>
        </div>
      </div>
    </header>

      <McpInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        serverCount={serverCount || 0}
      />
    </>
  );
}
