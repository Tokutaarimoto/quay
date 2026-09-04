"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface McpInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverCount: number;
}

export function McpInfoModal({ isOpen, onClose, serverCount }: McpInfoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full bg-surface border border-border rounded-card p-8 animate-modal-in"
        style={{ maxWidth: 480, maxHeight: "70vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={16} />
        </button>

        <h2 className="text-base font-semibold tracking-tight text-text-primary">
          What is MCP?
        </h2>

        <p className="text-[13px] text-text-secondary leading-[1.7] mt-4">
          Model Context Protocol (MCP) is an open standard that lets AI assistants connect to
          external tools and data. Think of it as USB-C for AI — one universal plug instead of
          custom wiring for every connection.
        </p>

        <div className="h-px bg-white/[0.06] my-5" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              For Developers
            </h3>
            <p className="text-[12px] text-text-secondary leading-[1.6] mt-2">
              An MCP server exposes tools, resources, and prompts to AI clients via a standardized
              protocol. You define a server (stdio, SSE, or HTTP transport), and any
              MCP-compatible client (Claude, Cursor, etc.) can use it. This registry indexes all
              public servers so you can discover, compare, and install them.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              For Everyone
            </h3>
            <p className="text-[12px] text-text-secondary leading-[1.6] mt-2">
              AI assistants like ChatGPT or Claude can&apos;t do much on their own — they can&apos;t
              read your files, check your calendar, or query your database. MCP servers are the
              &apos;hands&apos; that give AI the ability to actually do things. Each server in this
              registry is one specific capability: one for files, one for databases, one for Slack,
              and so on.
            </p>
          </div>
        </div>

        <div className="mt-6 text-[12px] text-text-muted">
          Quay indexes {serverCount.toLocaleString()} public MCP servers from the official
          registry.
        </div>

        <Link
          href="/learn"
          onClick={onClose}
          className="inline-block mt-4 text-[13px] text-accent hover:text-accent-hover transition-colors"
        >
          Learn more →
        </Link>
      </div>
    </div>
  );
}
