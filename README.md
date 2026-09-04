# Quay

Quay is a registry for Model Context Protocol servers.

## Quick Start

```bash
npm install
npm run sync
npm run dev
```

## Sync Script

The sync script pulls all servers from the official MCP Registry and stores them in a local SQLite database.

```bash
# Full sync (fetches all servers)
npm run sync

# Incremental sync (only recently updated servers)
npm run sync:incremental
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/servers` | GET | List servers with pagination, search, and filters |
| `/api/servers/:id` | GET | Get a single server by ID |
| `/api/health` | GET | Health check endpoint |

### Query Parameters

**`/api/servers`**

- `search` - Search by name, namespace, or description
- `status` - Filter by status: `active` or `deprecated`
- `transport` - Filter by transport: `stdio`, `sse`, or `http`
- `sort` - Sort by: `updated` (default), `name`, or `published`
- `order` - Sort order: `desc` (default) or `asc`
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 24, max: 100)

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- better-sqlite3

## License

MIT
