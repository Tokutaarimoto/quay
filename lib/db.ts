import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let sqliteDb: Database.Database | null = null;
let lastSynced: string | null = null;

function isVercel(): boolean {
  return !!process.env.VERCEL;
}

function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    const candidates = [
      path.join(process.cwd(), "data", "quay.db"),
      path.join(process.cwd(), ".next", "standalone", "data", "quay.db"),
      path.join("/var/task", "data", "quay.db"),
    ];

    const dbPath = candidates.find((p) => fs.existsSync(p));
    if (!dbPath) {
      throw new Error(
        "Database not found. Run `npm run sync` locally before deploying."
      );
    }

    sqliteDb = new Database(dbPath, { readonly: true });
    sqliteDb.pragma("journal_mode = WAL");
  }
  return sqliteDb;
}

export interface QueryRow {
  [key: string]: unknown;
}

export async function dbAll(
  sql: string,
  params: (string | number)[] = []
): Promise<QueryRow[]> {
  if (isVercel()) {
    const { getTursoClient } = await import("./turso");
    const client = getTursoClient();
    const result = await client.execute({ sql, args: params });
    return result.rows as QueryRow[];
  }
  const db = getSqliteDb();
  return db.prepare(sql).all(...params) as QueryRow[];
}

export async function dbGet(
  sql: string,
  params: (string | number)[] = []
): Promise<QueryRow | undefined> {
  if (isVercel()) {
    const { getTursoClient } = await import("./turso");
    const client = getTursoClient();
    const result = await client.execute({ sql, args: params });
    return result.rows[0] as QueryRow | undefined;
  }
  const db = getSqliteDb();
  return db.prepare(sql).get(...params) as QueryRow | undefined;
}

export async function dbRun(
  sql: string,
  params: (string | number | null)[] = []
): Promise<{ lastInsertRowid: number }> {
  if (isVercel()) {
    const { getTursoClient } = await import("./turso");
    const client = getTursoClient();
    const result = await client.execute({ sql, args: params });
    return { lastInsertRowid: Number(result.lastInsertRowid) };
  }
  const db = getSqliteDb();
  const result = db.prepare(sql).run(...params);
  return { lastInsertRowid: Number(result.lastInsertRowid) };
}

export async function getLastSynced(): Promise<string> {
  if (!lastSynced) {
    try {
      const result = await dbGet(
        "SELECT MAX(synced_at) as lastSynced FROM servers"
      );
      lastSynced =
        (result?.lastSynced as string | null) || new Date().toISOString();
    } catch {
      lastSynced = new Date().toISOString();
    }
  }
  return lastSynced;
}

export function resetLastSynced(): void {
  lastSynced = null;
}
