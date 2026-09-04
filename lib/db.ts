import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;
let lastSynced: string | null = null;

export function getDb(): Database.Database {
  if (!db) {
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

    db = new Database(dbPath, { readonly: true });
    db.pragma("journal_mode = WAL");
  }
  return db;
}

export function getLastSynced(): string {
  if (!lastSynced) {
    try {
      const database = getDb();
      const result = database
        .prepare("SELECT MAX(synced_at) as lastSynced FROM servers")
        .get() as { lastSynced: string | null };
      lastSynced = result?.lastSynced || new Date().toISOString();
    } catch {
      lastSynced = new Date().toISOString();
    }
  }
  return lastSynced;
}

export function resetLastSynced(): void {
  lastSynced = null;
}
