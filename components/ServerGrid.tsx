import { McpServer } from "@/types/server";
import { ServerCard } from "./ServerCard";

interface ServerGridProps {
  servers: McpServer[];
}

export function ServerGrid({ servers }: ServerGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
      {servers.map((server, index) => (
        <ServerCard key={server.id} server={server} index={index} />
      ))}
    </div>
  );
}
