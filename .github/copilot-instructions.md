# SecOps Global: AI Agent Guidelines

## Architecture Overview

This is a **full-stack monorepo** with:
- **Express backend** (`server/`) running on port 3000, serving API (`/api/*`) and WebSocket (`/ws`) endpoints
- **React + Vite client** (`client/`) proxies `/api` and `/ws` to the Express server during dev
- **Shared types** (`shared/`) define routes (via `@shared/routes`) and DB schema (Drizzle ORM + PostgreSQL)
- **Build output**: `npm run build` produces `dist/index.cjs` (bundled server) and `dist/public/` (client assets); production runs the bundled server, dev uses Vite HMR

### Key File Structure
- `package.json`: Single workspace; scripts: `dev` (tsx), `build` (esbuild), `start` (bundled), `check` (tsc), `db:push` (Drizzle Kit)
- `server/index.ts`: Express app setup, middleware (JSON logging, error handler), port from `$PORT` env var
- `server/routes.ts`: Auth, scans (AI analysis), CVEs, website verification, QR auth, stats endpoints
- `shared/schema.ts`: Drizzle table defs (users, scans, sessions), Zod validation schemas, TypeScript types
- `shared/routes.ts`: Route definitions (imported by client and server for type safety)
- `client/src/App.tsx`: Wouter router, QueryClient, i18n, Toast providers
- `vite.config.ts`: Resolves `@` → `client/src`, `@shared` → `shared`; dev proxies `/api` → Express; HMR on `/vite-hmr`

## Developer Workflows

### Start & Build
```bash
npm run dev          # Start Express (tsx) + Vite HMR; logs on http://localhost:3000
npm run build        # Transpile client (Vite) + server (esbuild); outputs dist/
npm run start        # Run bundled server from dist/index.cjs (production)
npm run check        # TypeScript check
npm run db:push      # Drizzle Kit: push schema to PostgreSQL
```

### Common Patterns
1. **Add an API endpoint**: Define route in `shared/routes.ts` → implement in `server/routes.ts` → call via React Query hook in client
2. **Add a DB table**: Create table in `shared/schema.ts`, run `db:push`, export Zod insert schema, create storage function in `server/storage.ts`
3. **Client data fetching**: Use React Query hooks in `client/src/hooks/` (e.g., `use-auth.ts`, `use-cve-data.ts`) to cache and sync API calls
4. **Styling**: Tailwind CSS (config in `tailwind.config.ts`); UI components use shadcn/ui patterns from `client/src/components/ui/`
5. **Type safety**: Import route paths from `@shared/routes` in server; import types from `shared/schema.ts` in client to ensure alignment

## Critical Patterns & Conventions

### Authentication
- Uses `passport` + `express-session` + `connect-pg-simple` for session persistence
- Replit Auth integration (optional env vars: `OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_API_KEY`)
- Local auth also supported via `server/auth.ts`
- Protected routes check `req.isAuthenticated()` and return 401 if false

### API Response Convention
- Success: `res.json(data)` with `200` status
- Validation: Zod parse errors return `400` with `{ message, field }`
- Auth: Return `401` (no status body needed) or `403` for forbidden
- Server errors: Return `500` with `{ message: "Internal Server Error" }`
- Logging: All `/api/*` requests logged with method, path, status, duration, and response body

### Scan Analysis Workflow
- Client sends POST `/api/scans` with `target` (code/text) and `scanType` (enum: `sql_injection`, `general`, `code_review`)
- Server calls OpenAI GPT-4o with security analysis prompt, parses JSON response into `Vulnerability[]`
- Stores scan with `result` (JSONB), `vulnerabilityCount`, `isSafe` in DB
- Returns full scan object to client; client routes to `/scan/:id` for display

### Frontend Routing & Layouts
- Routes defined in `client/src/App.tsx` using Wouter (lightweight routing)
- Public pages: `/`, `/privacy`, `/terms`; protected pages: `/dashboard`, `/scanner`, `/courses`, `/arena`
- `Layout` component wraps pages with Navigation header and footer; apply via JSX or wrap routes
- Query caching: `queryClient` configured in `client/src/lib/queryClient.ts`; use `@tanstack/react-query` hooks (`useQuery`, `useMutation`)

### Environment & Deployment
- Port via `$PORT` env var (defaults to 3000); Replit firewalls all other ports
- Dev: Vite runs on 5174 (for HMR), proxies `/api` and `/ws` to Express on 3000
- Production: Bundled server serves static client assets directly; no Vite in production
- Database: PostgreSQL via Drizzle ORM; schema in `shared/schema.ts`; session table required for express-session

## Integration Points

### OpenAI (GPT-4o)
- **Where**: `server/routes.ts` → `/api/scans` endpoint
- **Config**: Reads `OPENAI_API_KEY` or `AI_INTEGRATIONS_OPENAI_API_KEY` (Replit auto-injects if integration active); falls back gracefully if missing
- **Pattern**: Prompt for security analysis, expect JSON response, parse and store in JSONB

### WebSocket (QR Auth)
- **Where**: `server/qr-auth.ts` initializes WebSocket server on `httpServer`
- **Endpoints**: `/api/qr/generate`, `/api/qr/status/:sessionId`, `/api/qr/authenticate/:sessionId`
- **Pattern**: Generate session with `sessionId` + `expiresAt`, client polls status or uses WebSocket for real-time updates

### CVE Service
- **Where**: `server/cve-service.ts`
- **Endpoints**: `/api/cves/recent`, `/api/cves/stats`, `/api/cves/search`
- **Hook**: `client/src/hooks/use-cve-data.ts` fetches via React Query

### Website Verification
- **Where**: `server/website-verification.ts`
- **Endpoints**: `/api/verification/generate-code`, `/api/verification/verify`
- **Pattern**: Generate code, instruct user to place in website file or DNS record, verify ownership

## Tips for AI Agents

1. **Type-first approach**: Always check `shared/schema.ts` and `shared/routes.ts` before implementing; types drive both server and client
2. **Storage layer**: DB operations go through `server/storage.ts` functions (e.g., `createScan`, `getScansByUser`), not direct ORM calls in routes
3. **Error handling**: Don't forget Zod validation in request parsing; wrap OpenAI calls in try-catch with graceful fallback
4. **Testing imports**: Use `@` for client imports, `@shared` for shared code; never use relative paths across src/shared boundary
5. **Logging**: Express logs API requests automatically; add `log()` (from `server/index.ts`) for key workflows
6. **Replit-specific**: Check for Replit integration env vars; avoid hard-coded ports/domains; use `import.meta.dirname` for file paths in ESM

