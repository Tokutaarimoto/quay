import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serverId = decodeURIComponent(params.id);

    let db;
    try {
      db = getDb();
    } catch {
      return NextResponse.json(
        { error: "Database not synced." },
        { status: 503 }
      );
    }

    const checks = db
      .prepare(
        "SELECT * FROM uptime_checks WHERE server_id = ? ORDER BY checked_at DESC LIMIT 100"
      )
      .all(serverId);

    const stats = db
      .prepare(
        `SELECT 
          COUNT(*) as totalChecks,
          SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as onlineChecks,
          AVG(response_time) as avgResponseTime
        FROM uptime_checks 
        WHERE server_id = ?`
      )
      .get(serverId) as {
      totalChecks: number;
      onlineChecks: number;
      avgResponseTime: number | null;
    };

    const uptime =
      stats.totalChecks > 0
        ? Math.round((stats.onlineChecks / stats.totalChecks) * 100)
        : null;

    return NextResponse.json({
      checks,
      stats: {
        uptime,
        avgResponseTime: stats.avgResponseTime
          ? Math.round(stats.avgResponseTime)
          : null,
        totalChecks: stats.totalChecks,
      },
    });
  } catch (error) {
    console.error("Uptime API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
