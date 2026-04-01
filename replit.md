# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (Replit built-in)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── free-time-survey/   # React + Vite survey frontend (served at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, scripts)
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Free Time Survey App

A university student survey app for BAIS:3300 - Spring 2026 (Allie Krier).

### Pages
- `/` — Home page with welcome message
- `/survey` — Survey form (4 questions: age, major, hours/week, free time hobbies)
- `/results` — Aggregated results with Recharts visualizations

### Survey Questions
1. Age — dropdown 18–24
2. Major — text input
3. Hours per week for hobbies — radio buttons (1-2h, 2-4h, 4-6h, 8-10h, 10h+)
4. Free time activities — text input

### API Endpoints
- `POST /api/survey/submit` — submit a survey response
- `GET /api/survey/results` — get aggregated, anonymized results

### Database Schema
Table: `survey_responses`
- `id` serial primary key
- `age` integer
- `major` text
- `hours_per_week` text
- `free_time_hobbies` text
- `created_at` timestamptz

### Design
- Primary accent color: #8A3BDB (purple)
- Light neutral background, dark body text (#1a1a1a)
- Responsive single-column on mobile

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/free-time-survey` (`@workspace/free-time-survey`)

React + Vite frontend served at `/`. Uses:
- wouter for routing
- react-hook-form + zod for form validation
- recharts for data visualization
- @workspace/api-client-react for API hooks

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server.
- Routes: `src/routes/health.ts`, `src/routes/survey.ts`
- `pnpm --filter @workspace/api-server run dev` — run the dev server

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.
- Schema: `src/schema/survey.ts` — survey_responses table
- `pnpm --filter @workspace/db run push` — push schema changes

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec + Orval codegen config.
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
