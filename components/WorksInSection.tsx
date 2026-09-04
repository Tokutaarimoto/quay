"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RelatedServer {
  id: number;
  server_id: string;
  related_server_id: string;
  frequency: number;
  name: string;
  description: string;
  category: string;
  health_score: number;
}

interface WorksInSectionProps {
  serverId: string;
}

export function WorksInSection({ serverId }: WorksInSectionProps) {
  const [related, setRelated] = useState<RelatedServer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const fetchRelated = async () => {
    try {
      const response = await fetch(`/api/servers/${encodeURIComponent(serverId)}/works-with`);
      if (response.ok) {
        const data = await response.json();
        setRelated(data.related);
      }
    } catch {
      console.error("Failed to fetch related servers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-[12px] font-medium uppercase tracking-widest text-text-secondary mb-4">
        Works With
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-card bg-surface border border-border animate-shimmer h-20" />
          ))}
        </div>
      ) : related.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {related.map((server) => (
            <Link
              key={server.id}
              href={`/server/${encodeURIComponent(server.related_server_id)}`}
              className="p-3 rounded-card bg-surface border border-border hover:border-border-hover transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-medium text-text-primary truncate">
                  {server.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              </div>
              <div className="text-[12px] text-text-secondary line-clamp-1">
                {server.description}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-text-muted">
                  {server.frequency}x used together
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-card bg-surface border border-border">
          <div className="text-center py-4">
            <div className="text-[13px] text-text-secondary mb-1">No related servers yet</div>
            <div className="text-[12px] text-text-muted">Servers commonly used together will appear here.</div>
          </div>
        </div>
      )}
    </div>
  );
}
