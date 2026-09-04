import Link from "next/link";

export const metadata = {
  title: "Understanding MCP — Quay",
  description:
    "Learn about Model Context Protocol (MCP), how it works, and how to use MCP servers in your AI applications.",
};

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 h-14 flex items-center bg-transparent">
        <div className="max-w-content mx-auto px-5 md:px-8 w-full flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[15px] font-semibold tracking-tighter text-text-primary">
              Quay
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[640px] mx-auto px-5 md:px-8 py-8 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All servers
          </Link>

          <h1 className="text-xl font-semibold tracking-tighter text-text-primary">
            Understanding MCP
          </h1>

          <section className="mt-8">
            <h2 className="text-[15px] font-medium text-text-primary">
              What is it?
            </h2>
            <p className="text-sm text-text-secondary leading-[1.7] mt-3">
              Model Context Protocol is an open standard released by Anthropic in late 2024. It
              defines how AI applications (called &quot;clients&quot;) communicate with external tools
              and data sources (called &quot;servers&quot;). Before MCP, every AI app needed its own
              custom integration for every tool. MCP standardizes that connection so one server
              works with every client.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-[15px] font-medium text-text-primary">
              How it works
            </h2>
            <ul className="mt-3 space-y-3 text-sm text-text-secondary leading-[1.7]">
              <li>
                A <strong className="text-text-primary font-medium">client</strong> (like Claude
                Desktop or Cursor) discovers available MCP servers from a configuration file.
              </li>
              <li>
                Each <strong className="text-text-primary font-medium">server</strong> exposes three
                types of capabilities:{" "}
                <strong className="text-text-primary font-medium">tools</strong> (actions the AI can
                take), <strong className="text-text-primary font-medium">resources</strong> (data
                the AI can read), and{" "}
                <strong className="text-text-primary font-medium">prompts</strong> (reusable
                templates).
              </li>
              <li>
                Communication happens over a transport layer:{" "}
                <strong className="text-text-primary font-medium">stdio</strong> (local process),{" "}
                <strong className="text-text-primary font-medium">SSE</strong> (server-sent events
                over HTTP), or{" "}
                <strong className="text-text-primary font-medium">streamable HTTP</strong> (the
                newest, most flexible option).
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-[15px] font-medium text-text-primary">
              What&apos;s in this registry?
            </h2>
            <p className="text-sm text-text-secondary leading-[1.7] mt-3">
              Quay indexes all public MCP servers from the official registry at
              registry.modelcontextprotocol.io. Each entry includes the server&apos;s name,
              description, transport type, version, repository link, and installation command. Use
              the search to find what you need, or browse by transport type.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-[15px] font-medium text-text-primary">
              How to use a server
            </h2>
            <p className="text-sm text-text-secondary leading-[1.7] mt-3">
              Most servers install via npm. Open any server&apos;s detail page on Quay, copy the
              configuration JSON, and paste it into your client&apos;s MCP config file (usually{" "}
              <code className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[12px] font-mono text-text-secondary">
                mcp.json
              </code>{" "}
              or{" "}
              <code className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[12px] font-mono text-text-secondary">
                claude_desktop_config.json
              </code>
              ). Restart the client and the server&apos;s tools become available.
            </p>

            <div className="mt-4">
              <pre className="code-block">
                <code>{`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/dir"
      ]
    }
  }
}`}</code>
              </pre>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
