import { NextResponse } from "next/server";
import { getDb, getLastSynced } from "@/lib/db";

const processStartTime = Date.now();

export async function GET() {
  try {
    let db;
    try {
      db = getDb();
    } catch {
      return NextResponse.json(
        {
          status: "error",
          totalServers: 0,
          lastSynced: null,
          uptime: Math.floor((Date.now() - processStartTime) / 1000),
        },
        { status: 503 }
      );
    }

    const result = db
      .prepare("SELECT COUNT(*) as total FROM servers")
      .get() as { total: number };

    return NextResponse.json(
      {
        status: "ok",
        totalServers: result.total,
        lastSynced: getLastSynced(),
        uptime: Math.floor((Date.now() - processStartTime) / 1000),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { status: "error", error: "Internal server error" },
      { status: 500 }
    );
  }
}
