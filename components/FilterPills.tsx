"use client";

interface FilterPillsProps {
  activeTransport: string;
  onChange: (transport: string) => void;
}

const TRANSPORTS = ["all", "stdio", "sse", "http"];

export function FilterPills({ activeTransport, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
      {TRANSPORTS.map((transport) => (
        <button
          key={transport}
          onClick={() => onChange(transport === "all" ? "" : transport)}
          className={`h-7 px-3 rounded-badge text-xs font-medium whitespace-nowrap transition-all duration-150 ${
            (transport === "all" && activeTransport === "") ||
            activeTransport === transport
              ? "bg-accent-subtle text-accent-text border border-accent-border"
              : "bg-transparent text-text-secondary border border-transparent hover:bg-white/[0.04] hover:text-text-primary"
          }`}
        >
          {transport.charAt(0).toUpperCase() + transport.slice(1)}
        </button>
      ))}
    </div>
  );
}
