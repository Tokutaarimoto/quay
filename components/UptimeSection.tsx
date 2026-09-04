"use client";

import { useState, useEffect } from "react";

interface UptimeCheck {
  id: number;
  server_id: string;
  status: string;
  response_time: number | null;
  checked_at: string;
}

interface UptimeSectionProps {
  serverId: string;
}

export function UptimeSection({ serverId }: UptimeSectionProps) {
  const [checks, setChecks] = useState<UptimeCheck[]>([]);
  const [stats, setStats] = useState<{ uptime: number | null; avgResponseTime: number | null; totalChecks: number }>({
    uptime: null,
    avgResponseTime: null,
    totalChecks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUptime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const fetchUptime = async () => {
    try {
      const response = await fetch(`/api/servers/${encodeURIComponent(serverId)}/uptime`);
      if (response.ok) {
        const data = await response.json();
        setChecks(data.checks);
        setStats(data.stats);
      }
    } catch {
      console.error("Failed to fetch uptime");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-[12px] font-medium uppercase tracking-widest text-text-secondary mb-4">
        Uptime
      </div>

      {loading ? (
        <div className="p-4 rounded-card bg-surface border border-border animate-shimmer h-24" />
      ) : stats.totalChecks > 0 ? (
        <div className="p-4 rounded-card bg-surface border border-border">
          <div className="flex items-center gap-6 mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Uptime</div>
              <div className={`text-[20px] font-semibold ${stats.uptime && stats.uptime >= 99 ? "text-success" : stats.uptime && stats.uptime >= 95 ? "text-warning" : "text-error"}`}>
                {stats.uptime}%
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Avg Response</div>
              <div className="text-[20px] font-semibold text-text-primary">
                {stats.avgResponseTime}ms
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1">Checks</div>
              <div className="text-[20px] font-semibold text-text-primary">
                {stats.totalChecks}
              </div>
            </div>
          </div>

          {checks.length > 0 && (
            <div className="flex gap-0.5 h-8">
              {checks.slice(0, 50).map((check, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    check.status === "online" ? "bg-success" : check.status === "degraded" ? "bg-warning" : "bg-error"
                  }`}
                  title={`${check.status} - ${check.response_time || "N/A"}ms`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-card bg-surface border border-border">
          <div className="text-center py-4">
            <div className="text-[13px] text-text-secondary mb-1">No uptime data yet</div>
            <div className="text-[12px] text-text-muted">Uptime checks will appear here once monitoring is set up.</div>
          </div>
        </div>
      )}
    </div>
  );
}
