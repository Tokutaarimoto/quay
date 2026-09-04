import { NextResponse } from "next/server";
import { dbGet, getLastSynced } from "@/lib/db";

const processStartTime = Date.now();

export async function GET() {
  try {
    const result = await dbGet("SELECT COUNT(*) as total FROM servers");

    return NextResponse.json(
      {
        status: "ok",
        totalServers: (result?.total as number) || 0,
        lastSynced: await getLastSynced(),
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
