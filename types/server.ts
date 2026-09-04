export interface McpServer {
  id: string;
  name: string;
  namespace: string;
  description: string;
  repositoryUrl: string;
  version: string;
  packages: Array<{
    registryType: string;
    identifier: string;
    transport?: { type: string };
  }>;
  status: string;
  category: string;
  healthScore: number;
  complianceScore: number;
  stars: number;
  downloads: number;
  publishedAt: string | null;
  updatedAt: string | null;
  isLatest: boolean;
}

export interface Review {
  id: number;
  serverId: string;
  rating: number;
  title: string | null;
  content: string | null;
  author: string;
  createdAt: string;
}

export interface UptimeCheck {
  id: number;
  serverId: string;
  status: string;
  responseTime: number | null;
  checkedAt: string;
}

export interface WorksWith {
  id: number;
  serverId: string;
  relatedServerId: string;
  frequency: number;
}

export interface ServersResponse {
  servers: McpServer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  lastSynced: string;
}

export interface HealthResponse {
  status: string;
  totalServers: number;
  lastSynced: string;
  uptime: number;
}
