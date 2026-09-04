import { NextRequest, NextResponse } from "next/server";
import { dbGet } from "@/lib/db";

interface DbServer {
  id: string;
  name: string;
  namespace: string;
  description: string;
  repository_url: string;
  version: string;
  packages: string;
  status: string;
  published_at: string | null;
  updated_at: string | null;
  is_latest: number;
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
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    isLatest: row.is_latest === 1,
  };
}

function validateId(id: string): boolean {
  return /^[a-zA-Z0-9._/-]+$/.test(id) && !id.includes("..") && !id.startsWith("/");
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = decodeURIComponent(params.id);

    if (!validateId(id)) {
      return NextResponse.json(
        { error: "Invalid server ID" },
        { status: 400 }
      );
    }

    const server = await dbGet("SELECT * FROM servers WHERE id = ?", [id]) as DbServer | undefined;

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { server: mapServer(server) },
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
