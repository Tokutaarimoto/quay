"use client";

import { useState, useEffect } from "react";

interface InspectorData {
  server: {
    id: string;
    name: string;
    installCmd: string;
    npmPackage: string;
    transport: string;
  };
  tools: Array<{
    name: string;
    description: string;
    status: string;
  }>;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
    logging: boolean;
  };
}

interface InspectorSectionProps {
  serverId: string;
}

export function InspectorSection({ serverId }: InspectorSectionProps) {
  const [data, setData] = useState<InspectorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchInspector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const fetchInspector = async () => {
    try {
      const response = await fetch(`/api/servers/${encodeURIComponent(serverId)}/inspect`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-[12px] font-medium uppercase tracking-widest text-text-secondary mb-4">
        MCP Inspector
      </div>

      {loading ? (
        <div className="p-4 rounded-card bg-surface border border-border animate-shimmer h-32" />
      ) : error || !data ? (
        <div className="p-4 rounded-card bg-surface border border-border">
          <div className="text-center py-4">
            <div className="text-[13px] text-text-secondary mb-1">Inspector unavailable</div>
            <div className="text-[12px] text-text-muted">Could not load server capabilities.</div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-card bg-surface border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[13px] font-medium text-text-primary">Connected</span>
            <span className="text-[12px] text-text-muted">·</span>
            <span className="text-[12px] text-text-muted">{data.server.transport}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-2">Capabilities</div>
              <div className="space-y-1">
                {Object.entries(data.capabilities).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${value ? "bg-success" : "bg-text-muted"}`} />
                    <span className={`text-[12px] ${value ? "text-text-secondary" : "text-text-muted"}`}>
                      {key}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-widest text-text-muted mb-2">Tools ({data.tools.length})</div>
              <div className="space-y-1">
                {data.tools.map((tool) => (
                  <div key={tool.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[12px] text-text-secondary">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="text-[11px] uppercase tracking-widest text-text-muted mb-2">Test Connection</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-2 py-1 rounded bg-background text-[12px] text-text-secondary font-mono">
                {data.server.installCmd}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
