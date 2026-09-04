import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "quay.db");
const REGISTRY_URL = "https://registry.modelcontextprotocol.io/v0.1/servers";
const PAGE_SIZE = 100;
const DELAY_MS = 250;
const MAX_RETRIES = 3;

interface RegistryServer {
  server: {
    name: string;
    description?: string;
    version?: string;
    packages?: Array<{
      registryType: string;
      identifier: string;
      transport?: { type: string };
    }>;
    repository?: { url?: string };
  };
  _meta: {
    "io.modelcontextprotocol.registry/official": {
      status: string;
      publishedAt?: string;
      updatedAt?: string;
      isLatest?: boolean;
    };
  };
}

interface RegistryResponse {
  servers: RegistryServer[];
  metadata: {
    nextCursor?: string;
    count: number;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      console.error(
        `[Quay Sync] Attempt ${attempt}/${retries} failed: ${error}`
      );
      if (attempt < retries) {
        const backoff = Math.pow(2, attempt) * 1000;
        console.log(`[Quay Sync] Retrying in ${backoff / 1000}s...`);
        await sleep(backoff);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

function initDb(): Database.Database {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      namespace TEXT,
      description TEXT,
      repository_url TEXT,
      version TEXT,
      packages TEXT NOT NULL,
      status TEXT,
      category TEXT DEFAULT 'other',
      health_score INTEGER DEFAULT 50,
      compliance_score INTEGER DEFAULT 0,
      stars INTEGER DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      published_at TEXT,
      updated_at TEXT,
      is_latest INTEGER DEFAULT 1,
      synced_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_servers_name ON servers(name);
    CREATE INDEX IF NOT EXISTS idx_servers_namespace ON servers(namespace);
    CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
    CREATE INDEX IF NOT EXISTS idx_servers_category ON servers(category);
    CREATE INDEX IF NOT EXISTS idx_servers_updated ON servers(updated_at DESC);

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT,
      content TEXT,
      author TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (server_id) REFERENCES servers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_server ON reviews(server_id);

    CREATE TABLE IF NOT EXISTS uptime_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id TEXT NOT NULL,
      status TEXT NOT NULL,
      response_time INTEGER,
      checked_at TEXT NOT NULL,
      FOREIGN KEY (server_id) REFERENCES servers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_uptime_server ON uptime_checks(server_id);
    CREATE INDEX IF NOT EXISTS idx_uptime_checked ON uptime_checks(checked_at DESC);

    CREATE TABLE IF NOT EXISTS works_with (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id TEXT NOT NULL,
      related_server_id TEXT NOT NULL,
      frequency INTEGER DEFAULT 1,
      FOREIGN KEY (server_id) REFERENCES servers(id),
      FOREIGN KEY (related_server_id) REFERENCES servers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_works_with_server ON works_with(server_id);
  `);

  return db;
}

function categorizeServer(name: string, description: string, packages: string): string {
  const text = `${name} ${description} ${packages}`.toLowerCase();
  
  if (text.includes("postgres") || text.includes("mysql") || text.includes("sqlite") || text.includes("mongo") || text.includes("redis") || text.includes("database") || text.includes("sql"))
    return "database";
  if (text.includes("filesystem") || text.includes("file") || text.includes("storage"))
    return "filesystem";
  if (text.includes("aws") || text.includes("gcp") || text.includes("azure") || text.includes("cloud") || text.includes("vercel") || text.includes("docker") || text.includes("kubernetes") || text.includes("terraform") || text.includes("deploy"))
    return "cloud";
  if (text.includes("github") || text.includes("git") || text.includes("puppeteer") || text.includes("sentry") || text.includes("jenkins") || text.includes("brave") || text.includes("fetch") || text.includes("browser") || text.includes("scrape"))
    return "development";
  if (text.includes("slack") || text.includes("discord") || text.includes("email") || text.includes("communication") || text.includes("jira") || text.includes("linear") || text.includes("chat") || text.includes("message"))
    return "communication";
  if (text.includes("figma") || text.includes("image") || text.includes("media") || text.includes("video") || text.includes("audio") || text.includes("design"))
    return "media";
  if (text.includes("notion") || text.includes("confluence") || text.includes("todo") || text.includes("calendar") || text.includes("memory") || text.includes("sequential") || text.includes("task") || text.includes("project"))
    return "productivity";
  if (text.includes("security") || text.includes("auth") || text.includes("vault") || text.includes("encrypt") || text.includes("key"))
    return "security";
  if (text.includes("search") || text.includes("web") || text.includes("api") || text.includes("http") || text.includes("request"))
    return "web";
  if (text.includes("ai") || text.includes("llm") || text.includes("model") || text.includes("machine") || text.includes("neural") || text.includes("inference"))
    return "ai";
  
  return "other";
}

function calculateComplianceScore(server: RegistryServer): number {
  let score = 0;
  const { server: s } = server;
  
  if (s.description && s.description.length > 20) score += 20;
  if (s.version) score += 15;
  if (s.repository?.url) score += 15;
  if (s.packages && s.packages.length > 0) score += 20;
  if (s.description && s.description.length > 100) score += 10;
  if (server._meta["io.modelcontextprotocol.registry/official"]?.status === "active") score += 20;
  
  return Math.min(100, score);
}

function calculateHealthScore(server: RegistryServer): number {
  const meta = server._meta["io.modelcontextprotocol.registry/official"];
  let score = 50;
  
  if (meta.status === "active") score += 20;
  else if (meta.status === "deprecated") score -= 20;
  
  if (meta.isLatest) score += 10;
  
  if (meta.updatedAt) {
    const daysSinceUpdate = (Date.now() - new Date(meta.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 15;
    else if (daysSinceUpdate < 90) score += 10;
    else if (daysSinceUpdate < 365) score += 5;
    else score -= 10;
  }
  
  if (server.server.packages && server.server.packages.length > 0) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function extractServerData(
  item: RegistryServer,
  syncedAt: string
): {
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
  published_at: string | null;
  updated_at: string | null;
  is_latest: number;
  synced_at: string;
} {
  const { server, _meta } = item;
  const meta = _meta["io.modelcontextprotocol.registry/official"];

  const fullName = server.name;
  const lastSlash = fullName.lastIndexOf("/");
  const namespace = lastSlash > 0 ? fullName.substring(0, lastSlash) : "";
  const name = lastSlash > 0 ? fullName.substring(lastSlash + 1) : fullName;
  const packagesStr = JSON.stringify(server.packages || []);

  return {
    id: fullName,
    name,
    namespace,
    description: server.description || "",
    repository_url: server.repository?.url || "",
    version: server.version || "",
    packages: packagesStr,
    status: meta.status || "unknown",
    category: categorizeServer(name, server.description || "", packagesStr),
    health_score: calculateHealthScore(item),
    compliance_score: calculateComplianceScore(item),
    published_at: meta.publishedAt || null,
    updated_at: meta.updatedAt || null,
    is_latest: meta.isLatest ? 1 : 0,
    synced_at: syncedAt,
  };
}

function generateWorksWith(db: Database.Database): void {
  console.log("[Quay Sync] Generating 'Works With' relationships...");

  const servers = db.prepare("SELECT id, name, category, description FROM servers").all() as {
    id: string;
    name: string;
    category: string;
    description: string;
  }[];

  const categoryMap = new Map<string, typeof servers>();
  for (const server of servers) {
    const cat = server.category || "other";
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push(server);
  }

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO works_with (server_id, related_server_id, frequency)
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((pairs: Array<{ serverId: string; relatedId: string; frequency: number }>) => {
    for (const pair of pairs) {
      insertStmt.run(pair.serverId, pair.relatedId, pair.frequency);
    }
  });

  const pairs: Array<{ serverId: string; relatedId: string; frequency: number }> = [];

  for (const [category, categoryServers] of Array.from(categoryMap.entries())) {
    if (categoryServers.length < 2) continue;

    const limit = Math.min(categoryServers.length, 50);
    for (let i = 0; i < limit; i++) {
      const server = categoryServers[i];
      const relatedCount = Math.min(3, categoryServers.length - 1);

      for (let j = 1; j <= relatedCount; j++) {
        const relatedIdx = (i + j) % categoryServers.length;
        const related = categoryServers[relatedIdx];
        if (server.id !== related.id) {
          pairs.push({
            serverId: server.id,
            relatedId: related.id,
            frequency: Math.floor(Math.random() * 10) + 1,
          });
        }
      }
    }
  }

  insertMany(pairs);
  console.log(`[Quay Sync] Generated ${pairs.length} 'Works With' relationships`);
}

async function syncFull(): Promise<void> {
  const startTime = Date.now();
  const db = initDb();
  const syncedAt = new Date().toISOString();

  console.log("[Quay Sync] Starting full sync...");

  let cursor: string | undefined;
  let totalFetched = 0;
  let totalInserted = 0;
  let pageNum = 0;

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO servers (id, name, namespace, description, repository_url, version, packages, status, category, health_score, compliance_score, published_at, updated_at, is_latest, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertPage = db.transaction((servers: ReturnType<typeof extractServerData>[]) => {
    for (const server of servers) {
      insertStmt.run(
        server.id,
        server.name,
        server.namespace,
        server.description,
        server.repository_url,
        server.version,
        server.packages,
        server.status,
        server.category,
        server.health_score,
        server.compliance_score,
        server.published_at,
        server.updated_at,
        server.is_latest,
        server.synced_at
      );
    }
    return servers.length;
  });

  do {
    pageNum++;
    const url = cursor
      ? `${REGISTRY_URL}?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`
      : `${REGISTRY_URL}?limit=${PAGE_SIZE}`;

    try {
      const response = await fetchWithRetry(url);
      const data: RegistryResponse = await response.json();

      const servers = data.servers.map((item) =>
        extractServerData(item, syncedAt)
      );

      const inserted = insertPage(servers);
      totalInserted += inserted;
      totalFetched += data.servers.length;
      cursor = data.metadata.nextCursor;

      if (pageNum % 10 === 0) {
        console.log(
          `[Quay Sync] Fetched ${totalFetched.toLocaleString()} servers, ${totalInserted.toLocaleString()} in DB...`
        );
      }

      if (cursor) {
        await sleep(DELAY_MS);
      }
    } catch (error) {
      console.error(`[Quay Sync] Error on page ${pageNum}: ${error}`);
      break;
    }
  } while (cursor);

  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  const stats = db
    .prepare(
      `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'deprecated' THEN 1 ELSE 0 END) as deprecated,
      SUM(CASE WHEN status NOT IN ('active', 'deprecated') THEN 1 ELSE 0 END) as other
    FROM servers
  `
    )
    .get() as {
    total: number;
    active: number;
    deprecated: number;
    other: number;
  };

  const transportStats = db
    .prepare(
      `
    SELECT
      SUM(CASE WHEN packages LIKE '%"type":"stdio"%' THEN 1 ELSE 0 END) as stdio,
      SUM(CASE WHEN packages LIKE '%"type":"http"%' OR packages LIKE '%"type":"streamable-http"%' THEN 1 ELSE 0 END) as http,
      SUM(CASE WHEN packages LIKE '%"type":"sse"%' THEN 1 ELSE 0 END) as sse
    FROM servers
  `
    )
    .get() as { stdio: number; http: number; sse: number };

  console.log(`[Quay Sync] Complete.
  Total servers: ${stats.total.toLocaleString()}
  Active: ${(stats.active || 0).toLocaleString()} | Deprecated: ${(stats.deprecated || 0).toLocaleString()} | Other: ${(stats.other || 0).toLocaleString()}
  Transports: stdio (${(transportStats.stdio || 0).toLocaleString()}) | http (${(transportStats.http || 0).toLocaleString()}) | sse (${(transportStats.sse || 0).toLocaleString()})
  Elapsed: ${minutes}m ${seconds}s
  Last sync: ${syncedAt}`);

  generateWorksWith(db);

  db.close();
}

async function syncIncremental(since: string): Promise<void> {
  const startTime = Date.now();
  const db = initDb();
  const syncedAt = new Date().toISOString();

  console.log(`[Quay Sync] Starting incremental sync since ${since}...`);

  let cursor: string | undefined;
  let totalFetched = 0;
  let pageNum = 0;

  const upsertStmt = db.prepare(`
    INSERT INTO servers (id, name, namespace, description, repository_url, version, packages, status, published_at, updated_at, is_latest, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      namespace = excluded.namespace,
      description = excluded.description,
      repository_url = excluded.repository_url,
      version = excluded.version,
      packages = excluded.packages,
      status = excluded.status,
      published_at = excluded.published_at,
      updated_at = excluded.updated_at,
      is_latest = excluded.is_latest,
      synced_at = excluded.synced_at
  `);

  const upsertMany = db.transaction((servers: ReturnType<typeof extractServerData>[]) => {
    for (const server of servers) {
      upsertStmt.run(
        server.id,
        server.name,
        server.namespace,
        server.description,
        server.repository_url,
        server.version,
        server.packages,
        server.status,
        server.published_at,
        server.updated_at,
        server.is_latest,
        server.synced_at
      );
    }
  });

  const allServers: ReturnType<typeof extractServerData>[] = [];

  do {
    pageNum++;
    const url = cursor
      ? `${REGISTRY_URL}?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}&updated_since=${encodeURIComponent(since)}`
      : `${REGISTRY_URL}?limit=${PAGE_SIZE}&updated_since=${encodeURIComponent(since)}`;

    try {
      const response = await fetchWithRetry(url);
      const data: RegistryResponse = await response.json();

      for (const item of data.servers) {
        allServers.push(extractServerData(item, syncedAt));
      }

      totalFetched += data.servers.length;
      cursor = data.metadata.nextCursor;

      if (pageNum % 10 === 0) {
        console.log(
          `[Quay Sync] Fetched ${totalFetched.toLocaleString()} servers...`
        );
      }

      if (cursor) {
        await sleep(DELAY_MS);
      }
    } catch (error) {
      console.error(`[Quay Sync] Error on page ${pageNum}: ${error}`);
      break;
    }
  } while (cursor);

  console.log(`[Quay Sync] Upserting ${allServers.length} servers into DB...`);
  upsertMany(allServers);

  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  console.log(`[Quay Sync] Incremental sync complete.
  Updated servers: ${allServers.length.toLocaleString()}
  Elapsed: ${minutes}m ${seconds}s
  Last sync: ${syncedAt}`);

  db.close();
}

async function main() {
  const args = process.argv.slice(2);
  const sinceArg = args.find((a) => a.startsWith("--since="));

  if (sinceArg) {
    let since = sinceArg.split("=")[1];
    if (since === "24h") {
      const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
      since = d.toISOString();
    }
    await syncIncremental(since);
  } else {
    await syncFull();
  }
}

main().catch((error) => {
  console.error("[Quay Sync] Fatal error:", error);
  process.exit(1);
});
