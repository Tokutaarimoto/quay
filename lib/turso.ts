import { createClient } from "@libsql/client";

let client: ReturnType<typeof createClient> | null = null;

export function getTursoClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error("TURSO_DATABASE_URL not set");
    }

    client = createClient({
      url,
      authToken: authToken || undefined,
    });
  }
  return client;
}
