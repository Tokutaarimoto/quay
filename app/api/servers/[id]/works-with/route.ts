import { NextRequest, NextResponse } from "next/server";
import { dbAll } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serverId = decodeURIComponent(params.id);

    const related = await dbAll(
      `SELECT w.*, s.name, s.description, s.category, s.health_score
       FROM works_with w
       JOIN servers s ON s.id = w.related_server_id
       WHERE w.server_id = ?
       ORDER BY w.frequency DESC
       LIMIT 10`,
      [serverId]
    );

    return NextResponse.json({ related });
  } catch (error) {
    console.error("Works With API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
