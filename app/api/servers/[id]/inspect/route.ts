import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface DbServer {
  id: string;
  name: string;
  packages: string;
  repository_url: string;
}

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

    const server = db
      .prepare("SELECT * FROM servers WHERE id = ?")
      .get(serverId) as DbServer | undefined;

    if (!server) {
      return NextResponse.json(
        { error: "Server not found" },
        { status: 404 }
      );
    }

    let packages;
    try {
      packages = JSON.parse(server.packages);
    } catch {
      packages = [];
    }

    const npmPackage = packages.find(
      (p: { registryType: string }) => p.registryType === "npm"
    );

    if (!npmPackage) {
      return NextResponse.json(
        { error: "No npm package found for this server" },
        { status: 400 }
      );
    }

    const installCmd = `npx -y ${npmPackage.identifier}`;

    const tools = [
      {
        name: "list_tools",
        description: "List available tools from this MCP server",
        status: "available",
      },
      {
        name: "list_resources",
        description: "List available resources from this MCP server",
        status: "available",
      },
      {
        name: "list_prompts",
        description: "List available prompts from this MCP server",
        status: "available",
      },
    ];

    return NextResponse.json({
      server: {
        id: server.id,
        name: server.name,
        installCmd,
        npmPackage: npmPackage.identifier,
        transport: npmPackage.transport?.type || "stdio",
      },
      tools,
      capabilities: {
        tools: true,
        resources: true,
        prompts: true,
        logging: false,
      },
    });
  } catch (error) {
    console.error("Inspect API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
