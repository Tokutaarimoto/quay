import Database from "better-sqlite3";
import { createClient, type InValue } from "@libsql/client";
import path from "path";
import fs from "fs";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const DB_PATH = path.join(process.cwd(), "data", "quay.db");

const BATCH_SIZE = 50;

async function main() {
  if (!TURSO_URL) {
    console.error("[Quay] TURSO_DATABASE_URL not set. Run with:");
    console.error("  TURSO_DATABASE_URL=libsql://your-db.turso.io TURSO_AUTH_TOKEN=your-token npm run db:push");
    process.exit(1);
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error("[Quay] data/quay.db not found. Run `npm run sync` first.");
    process.exit(1);
  }

  const sqlite = new Database(DB_PATH, { readonly: true });
  const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN || undefined });

  console.log("[Quay] Pushing local SQLite to Turso...");

  // Create tables
  await turso.executeMultiple(`
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

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT,
      content TEXT,
      author TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS uptime_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id TEXT NOT NULL,
      status TEXT NOT NULL,
      response_time INTEGER,
      checked_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS works_with (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id TEXT NOT NULL,
      related_server_id TEXT NOT NULL,
      frequency INTEGER DEFAULT 1
    );
  `);

  // Push servers in batches
  const servers = sqlite.prepare("SELECT * FROM servers").all() as Record<string, unknown>[];
  console.log(`[Quay] Pushing ${servers.length} servers...`);

  for (let i = 0; i < servers.length; i += BATCH_SIZE) {
    const batch = servers.slice(i, i + BATCH_SIZE);
    const statements = batch.map((s) => ({
      sql: `INSERT OR REPLACE INTO servers (id, name, namespace, description, repository_url, version, packages, status, category, health_score, compliance_score, stars, downloads, published_at, updated_at, is_latest, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        s.id, s.name, s.namespace, s.description, s.repository_url,
        s.version, s.packages, s.status, s.category, s.health_score,
        s.compliance_score, s.stars, s.downloads, s.published_at,
        s.updated_at, s.is_latest, s.synced_at,
      ] as InValue[],
    }));
    await turso.batch(statements);
    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`[Quay] ...${Math.min(i + BATCH_SIZE, servers.length)}/${servers.length}`);
    }
  }
  console.log(`[Quay] Servers pushed.`);

  // Push reviews
  const reviews = sqlite.prepare("SELECT * FROM reviews").all() as Record<string, unknown>[];
  if (reviews.length > 0) {
    console.log(`[Quay] Pushing ${reviews.length} reviews...`);
    for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
      const batch = reviews.slice(i, i + BATCH_SIZE);
      const statements = batch.map((r) => ({
        sql: `INSERT INTO reviews (server_id, rating, title, content, author, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [r.server_id, r.rating, r.title, r.content, r.author, r.created_at] as InValue[],
      }));
      await turso.batch(statements);
    }
  }

  // Push works_with
  const works = sqlite.prepare("SELECT * FROM works_with").all() as Record<string, unknown>[];
  if (works.length > 0) {
    console.log(`[Quay] Pushing ${works.length} works_with...`);
    for (let i = 0; i < works.length; i += BATCH_SIZE) {
      const batch = works.slice(i, i + BATCH_SIZE);
      const statements = batch.map((w) => ({
        sql: `INSERT INTO works_with (server_id, related_server_id, frequency) VALUES (?, ?, ?)`,
        args: [w.server_id, w.related_server_id, w.frequency] as InValue[],
      }));
      await turso.batch(statements);
    }
  }

  // Push uptime checks
  const checks = sqlite.prepare("SELECT * FROM uptime_checks").all() as Record<string, unknown>[];
  if (checks.length > 0) {
    console.log(`[Quay] Pushing ${checks.length} uptime checks...`);
    for (let i = 0; i < checks.length; i += BATCH_SIZE) {
      const batch = checks.slice(i, i + BATCH_SIZE);
      const statements = batch.map((c) => ({
        sql: `INSERT INTO uptime_checks (server_id, status, response_time, checked_at) VALUES (?, ?, ?, ?)`,
        args: [c.server_id, c.status, c.response_time, c.checked_at] as InValue[],
      }));
      await turso.batch(statements);
    }
  }

  sqlite.close();
  console.log("[Quay] Done! Turso database is in sync.");
}

main().catch((err) => {
  console.error("[Quay] Fatal:", err);
  process.exit(1);
});
