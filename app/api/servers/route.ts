import { NextRequest, NextResponse } from "next/server";
import { getDb, getLastSynced } from "@/lib/db";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_LIMIT_WINDOW = 60 * 1000;

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

interface DbServer {
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
  stars: number;
  downloads: number;
  published_at: string | null;
  updated_at: string | null;
  is_latest: number;
}

function sanitizeSearch(input: string): string {
  let cleaned = input.replace(/<[^>]*>/g, "");
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200);
  }
  return cleaned;
}

function mapServer(row: DbServer) {
  let packages;
  try {
    packages = JSON.parse(row.packages);
  } catch {
    packages = [];
  }

  return {
    id: row.id,
    name: row.name,
    namespace: row.namespace,
    description: row.description,
    repositoryUrl: row.repository_url,
    version: row.version,
    packages,
    status: row.status,
    category: row.category || "other",
    healthScore: row.health_score || 50,
    complianceScore: row.compliance_score || 0,
    stars: row.stars || 0,
    downloads: row.downloads || 0,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    isLatest: row.is_latest === 1,
  };
}

export async function GET(req: NextRequest) {
  try {
    const ip = getRateLimitKey(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in 60s." },
        { status: 429 }
      );
    }

    let db;
    try {
      db = getDb();
    } catch {
      return NextResponse.json(
        { error: "Database not synced. Run `npm run sync` first." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const transport = searchParams.get("transport");
    const sort = searchParams.get("sort") || "updated";
    const order = searchParams.get("order") || "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "24", 10))
    );

    if (search && search.length > 200) {
      return NextResponse.json(
        { error: "Invalid parameter: search (max 200 chars)" },
        { status: 400 }
      );
    }

    if (status && !["active", "deprecated"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid parameter: status" },
        { status: 400 }
      );
    }

    if (transport && !["stdio", "sse", "http"].includes(transport)) {
      return NextResponse.json(
        { error: "Invalid parameter: transport" },
        { status: 400 }
      );
    }

    if (!["updated", "name", "published"].includes(sort)) {
      return NextResponse.json(
        { error: "Invalid parameter: sort" },
        { status: 400 }
      );
    }

    if (!["asc", "desc"].includes(order)) {
      return NextResponse.json(
        { error: "Invalid parameter: order" },
        { status: 400 }
      );
    }

    let whereClause = "WHERE 1=1";
    const params: (string | number)[] = [];

    if (search) {
      const sanitized = sanitizeSearch(search);
      whereClause +=
        " AND (name LIKE ? OR namespace LIKE ? OR description LIKE ?)";
      const term = `%${sanitized}%`;
      params.push(term, term, term);
    }

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (transport) {
      if (transport === "http") {
        whereClause +=
          " AND (packages LIKE ? OR packages LIKE ?)";
        params.push('%"type":"http"%', '%"type":"streamable-http"%');
      } else {
        whereClause += " AND packages LIKE ?";
        params.push(`%"type":"${transport}"%`);
      }
    }

    const sortColumn =
      sort === "name"
        ? "name"
        : sort === "published"
        ? "published_at"
        : "updated_at";

    const countResult = db
      .prepare(`SELECT COUNT(*) as total FROM servers ${whereClause}`)
      .get(...params) as { total: number };

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const servers = db
      .prepare(
        `SELECT * FROM servers ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset) as DbServer[];

    return NextResponse.json(
      {
        servers: servers.map(mapServer),
        total,
        page,
        limit,
        totalPages,
        lastSynced: getLastSynced(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
