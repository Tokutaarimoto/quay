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

    const reviews = db
      .prepare(
        "SELECT * FROM reviews WHERE server_id = ? ORDER BY created_at DESC"
      )
      .all(serverId);

    const stats = db
      .prepare(
        "SELECT COUNT(*) as count, AVG(rating) as avgRating FROM reviews WHERE server_id = ?"
      )
      .get(serverId) as { count: number; avgRating: number | null };

    return NextResponse.json({
      reviews,
      stats: {
        count: stats.count,
        avgRating: stats.avgRating ? Math.round(stats.avgRating * 10) / 10 : null,
      },
    });
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serverId = decodeURIComponent(params.id);
    const body = await req.json();
    const { rating, title, content, author } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!author || author.length > 100) {
      return NextResponse.json(
        { error: "Author is required (max 100 chars)" },
        { status: 400 }
      );
    }

    let db;
    try {
      db = getDb();
    } catch {
      return NextResponse.json(
        { error: "Database not synced." },
        { status: 503 }
      );
    }

    const result = db
      .prepare(
        "INSERT INTO reviews (server_id, rating, title, content, author, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        serverId,
        rating,
        title || null,
        content || null,
        author,
        new Date().toISOString()
      );

    return NextResponse.json({
      id: result.lastInsertRowid,
      message: "Review submitted",
    });
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
