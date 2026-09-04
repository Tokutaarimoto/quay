import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serverId = decodeURIComponent(params.id);

    const checks = await dbAll(
      "SELECT * FROM uptime_checks WHERE server_id = ? ORDER BY checked_at DESC LIMIT 100",
      [serverId]
    );

    const stats = await dbGet(
      `SELECT 
        COUNT(*) as totalChecks,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as onlineChecks,
        AVG(response_time) as avgResponseTime
      FROM uptime_checks 
      WHERE server_id = ?`,
      [serverId]
    ) as {
      totalChecks: number;
      onlineChecks: number;
      avgResponseTime: number | null;
    } | undefined;

    const uptime =
      stats && stats.totalChecks > 0
        ? Math.round(((stats.onlineChecks || 0) / stats.totalChecks) * 100)
        : null;

    return NextResponse.json({
      checks,
      stats: {
        uptime,
        avgResponseTime: stats?.avgResponseTime
          ? Math.round(stats.avgResponseTime)
          : null,
        totalChecks: stats?.totalChecks || 0,
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
