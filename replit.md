# SECOPS - Security Analysis Platform

## Overview

SECOPS is a security-focused web application that provides AI-powered code vulnerability scanning and analysis. The platform enables users to submit code snippets or URLs for security review, detecting issues like SQL injection, XSS, and other common vulnerabilities. Results are stored per-user with statistics and visualization dashboards.

The application follows a monorepo structure with a React frontend, Express backend, PostgreSQL database, and OpenAI integration for AI-powered security analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with hot module replacement
- **Design Theme**: Dark cybersecurity aesthetic with neon green accents (Orbitron, Exo 2, Fira Code fonts)

Path aliases configured:
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Dual system supporting Replit Auth (OIDC) and local passport-local strategy
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **AI Integration**: OpenAI API for security analysis (vulnerability detection prompts)

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between frontend/backend)
- **Migrations**: Drizzle Kit with `db:push` command

Key tables:
- `users` - User accounts with optional password (supports both OIDC and local auth)
- `sessions` - Session storage for authentication
- `scans` - Security scan results with JSONB for analysis data
- `conversations` / `messages` - Chat functionality (AI chat integration)

### Build System
- **Development**: `tsx` for TypeScript execution, Vite dev server with HMR
- **Production**: Custom build script using esbuild for server, Vite for client
- **Output**: Server bundles to `dist/index.cjs`, client to `dist/public`

### Replit Integrations
Located in `server/replit_integrations/`:
- **auth/**: Replit OIDC authentication with passport
- **chat/**: AI chat functionality with conversation storage
- **image/**: Image generation using OpenAI gpt-image-1 model
- **batch/**: Batch processing utilities with rate limiting and retries

## External Dependencies

### APIs & Services
- **OpenAI API**: Security analysis and chat (configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- **Replit Auth**: OIDC-based authentication when running on Replit

### Database
- **PostgreSQL**: Primary data store (configured via `DATABASE_URL` environment variable)

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `OPENAI_API_KEY` or `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API access
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Optional custom OpenAI endpoint
- `ISSUER_URL` - OIDC issuer for Replit Auth (defaults to https://replit.com/oidc)

### Key NPM Packages
- UI: shadcn/ui components (Radix primitives), Tailwind CSS, Framer Motion
- Charts: Recharts for data visualization
- Forms: react-hook-form with zod resolvers
- Utilities: date-fns, clsx, tailwind-merge