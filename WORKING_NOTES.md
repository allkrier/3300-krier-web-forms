# Working Notes — Free Time Survey

> **INTERNAL DOCUMENT — NOT PUBLIC-FACING.**
> This file is for the developer and any AI assistants working on this project.
> Update this file at the end of every working session before closing.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before doing any work on this project.
2. Read `README.md` for public-facing context, installation steps, and the tech stack overview.
3. Do not change the folder structure, naming conventions, or architecture without discussing it with the developer first.
4. Follow all conventions in the **CONVENTIONS** section exactly — do not introduce new patterns unless the existing ones genuinely cannot handle the requirement.
5. Do not suggest anything listed under **WHAT WAS TRIED AND REJECTED**. Those decisions are final.
6. Ask before making any large structural changes: switching routing libraries, replacing the form library, changing the Supabase client strategy, or adding a backend proxy.
7. This project was AI-assisted. Refactor conservatively — prefer targeted edits over rewrites.
8. The frontend talks **directly** to Supabase. There is no backend proxy for survey data. Do not introduce one unless explicitly asked.

---

## Current State

**Last Updated:** 2026-04-01

The app is fully built and running on Replit. The Supabase client is connected with live credentials. The database table (`survey_responses`) has not yet been confirmed as created — the developer must run `supabase-setup.sql` in the Supabase SQL Editor to activate full functionality.

### What Is Working

- [x] Home page (`/`) with navigation to survey and results
- [x] Survey form (`/survey`) — all four questions, Zod validation, inline errors
- [x] Thank-you confirmation screen with response summary after successful submission
- [x] Results page (`/results`) — five Recharts visualizations with client-side aggregation
- [x] Supabase client configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Footer on every page: "Survey by Allie Krier, BAIS:3300 - spring 2026."
- [x] WCAG 2.1 AA accessibility: labelled inputs, `aria-describedby`, `aria-invalid`, keyboard nav
- [x] `data-testid` attributes on all interactive elements
- [x] Azure Static Web Apps deployment config (`staticwebapp.config.json`, fixed `vite.config.ts`)
- [x] `supabase-setup.sql` script for one-step table creation
- [x] `README.md` at project root

### What Is Partially Built

- [ ] Results page loads but returns an error if the Supabase table does not exist yet
- [ ] Submission shows a descriptive error message for missing table (code `42P01`), but other Supabase error codes fall back to a generic message

### What Is Not Started

- [ ] Duplicate-submission prevention
- [ ] CSV export of results
- [ ] Admin interface for question configuration
- [ ] Date range filtering on results
- [ ] Automated end-to-end tests

---

## Current Task

The developer was working on finalising the Azure Static Web App deployment configuration and project documentation. The `vite.config.ts` was updated to not throw when `PORT` or `BASE_PATH` are missing (both are Replit-specific and absent in Azure's build environment). `README.md` and `WORKING_NOTES.md` were generated.

**Single next step:** Developer must run `artifacts/free-time-survey/supabase-setup.sql` in the Supabase SQL Editor to create the `survey_responses` table and enable the RLS policies, then verify a test submission and results page load correctly.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | ^18.x (catalog) | Component model; required by the Replit monorepo scaffold |
| TypeScript | ^5.x (catalog) | Type safety for form values, Supabase row types, chart data |
| Vite | ^6.x (catalog) | Fast dev server; standard for the pnpm monorepo template |
| Tailwind CSS | ^4.x (catalog) | Utility-first; consistent with the monorepo scaffold |
| shadcn/ui (Radix UI) | ^1–2.x per primitive | Accessible headless components; Select, RadioGroup, Form, Alert wired up out of the box |
| react-hook-form | ^7.55.0 | Performant uncontrolled form; pairs cleanly with Zod resolver |
| Zod | ^3.x (catalog) | Schema-first validation; single source of truth for form rules and TypeScript types |
| Recharts | ^2.15.2 | Declarative React charts; no canvas manipulation needed |
| wouter | ^3.3.5 | Lightweight client-side router; no need for React Router's weight |
| @supabase/supabase-js | ^2.101.0 | Official Supabase client; handles auth, insert, select with typed responses |
| Supabase (PostgreSQL) | Hosted (cloud) | Developer already had a Supabase project; avoids managing a separate DB |

---

## Project Structure Notes

```
/
├── README.md                          # Public-facing documentation
├── WORKING_NOTES.md                   # This file
├── pnpm-workspace.yaml                # Monorepo root; shared dependency catalog
├── tsconfig.json                      # Root TypeScript solution references
├── artifacts/
│   ├── free-time-survey/              # ← Primary artifact (the survey app)
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   └── staticwebapp.config.json   # Azure SWA routing fallback
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Layout.tsx             # Shared wrapper: max-width container + footer
│   │   │   │   └── ui/                    # shadcn/ui primitives (do not edit manually)
│   │   │   ├── lib/
│   │   │   │   └── supabase.ts            # Supabase client singleton + SurveyRow type
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx           # Route: /
│   │   │   │   ├── SurveyPage.tsx         # Route: /survey
│   │   │   │   ├── ResultsPage.tsx        # Route: /results
│   │   │   │   └── not-found.tsx          # 404 fallback
│   │   │   ├── App.tsx                    # wouter Switch/Route definitions
│   │   │   ├── index.css                  # Global styles + Tailwind theme tokens
│   │   │   └── main.tsx                   # ReactDOM.createRoot entry point
│   │   ├── supabase-setup.sql             # Run once in Supabase SQL Editor
│   │   ├── vite.config.ts                 # Dev server + build config
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── api-server/                    # Express 5 API server (not used by frontend for survey data)
│   └── mockup-sandbox/                # Vite component preview server (canvas prototyping only)
└── lib/
    ├── api-spec/openapi.yaml          # OpenAPI contract (not actively used by frontend)
    ├── api-client-react/              # Generated React Query hooks (not used by frontend)
    ├── api-zod/                       # Generated Zod schemas (not used by frontend)
    └── db/src/schema/survey.ts        # Drizzle ORM schema (not used; Supabase is the live DB)
```

### Non-obvious decisions

- `src/components/ui/` is generated by shadcn/ui. Never edit these files manually — re-run the shadcn CLI to add or update components.
- `lib/api-client-react/`, `lib/api-zod/`, and `lib/db/` exist from the initial scaffold but are **not used** by the frontend. The frontend talks directly to Supabase.
- Aggregation of results (majors, hobbies, hours, ages) is done entirely client-side in `ResultsPage.tsx` after fetching all rows. There is no server-side GROUP BY.
- Case normalization in aggregation uses `.toLowerCase()` so "BAIS" and "bais" are counted together.

### Files and folders that must not be changed without discussion

- `artifacts/free-time-survey/src/lib/supabase.ts` — changing the client config affects both submission and results.
- `artifacts/free-time-survey/public/staticwebapp.config.json` — removing this breaks Azure SWA routing.
- `artifacts/free-time-survey/vite.config.ts` — PORT/BASE_PATH handling was intentionally made optional for Azure compatibility.
- `pnpm-workspace.yaml` — shared catalog; changes affect all packages in the monorepo.

---

## Data / Database

### Table: `survey_responses` (Supabase / PostgreSQL)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `SERIAL` (integer) | Auto | Primary key, auto-incremented |
| `age` | `INTEGER` | Yes | Constrained `CHECK (age >= 18 AND age <= 24)` |
| `major` | `TEXT` | Yes | Free-text; case-normalized client-side for aggregation |
| `hours_per_week` | `TEXT` | Yes | One of five fixed option strings from the radio group |
| `free_time_hobbies` | `TEXT` | Yes | Free-text; case-normalized client-side for aggregation |
| `created_at` | `TIMESTAMPTZ` | Auto | Defaults to `NOW()` on insert |

**Row Level Security:** Enabled. Two policies exist:
- `Allow public inserts` — `anon` role, `FOR INSERT`, `WITH CHECK (true)`
- `Allow public reads` — `anon` role, `FOR SELECT`, `USING (true)`

No update or delete policies exist. Rows are immutable once inserted.

---

## Conventions

### Naming conventions

- **Files:** PascalCase for React components (`SurveyPage.tsx`), camelCase for utilities (`supabase.ts`)
- **CSS classes:** Tailwind utility classes only; no custom CSS class names unless defining a theme token in `index.css`
- **Supabase columns:** `snake_case` (matches PostgreSQL convention)
- **TypeScript / React props:** `camelCase`
- **Test IDs:** `data-testid` format is `noun-descriptor`, e.g. `button-submit-survey`, `input-major`, `error-age`

### Code style

- No emojis anywhere in the UI
- No default exports for utility files; named exports only (`export const supabase = ...`)
- Page components use default exports (`export default function SurveyPage()`)
- All async Supabase calls destructure `{ data, error }` and check `error` before using `data`
- Form fields always have `aria-describedby` pointing to the error message element and `aria-invalid` set from `fieldState.error`

### Framework patterns

- Forms: `react-hook-form` with `zodResolver`. Schema defined once as a `z.object()`; `z.infer<typeof schema>` used for the form value type. No manual `register` calls — use `<FormField>` with `render` prop.
- Routing: `wouter` `<Switch>` / `<Route>` in `App.tsx`. Navigation uses `<Link href="...">` — not `<a>`.
- Layout: Every page wraps its content in `<Layout>`. The footer is rendered inside `Layout`, not in individual pages.
- Supabase: Import `supabase` from `@/lib/supabase`. Never create a second client instance.

### Git commit style

Conventional Commits format: `type(scope): description`
- `feat(survey): add age dropdown validation`
- `fix(results): handle empty response array`
- `docs: update README with Azure build settings`
- `chore: update supabase-js to 2.101.0`

---

## Decisions and Tradeoffs

- **Direct Supabase from frontend, no backend proxy.** The `anon` key is intentionally public — Supabase RLS enforces what the anon role can do (insert and select only). This avoids CORS complexity and a running server cost. Do not suggest adding a proxy.
- **Client-side aggregation on the results page.** All rows are fetched and reduced in JavaScript. Acceptable for a class survey with a small number of respondents. A `GROUP BY` query would be more scalable but adds query complexity for no current benefit.
- **Free-text fields for major and hobbies.** A dropdown or tag system would produce cleaner data but was not part of the PRD. Case normalization (`.toLowerCase()`) partially mitigates the fragmentation problem.
- **Recharts over Chart.js or D3.** Recharts is React-native and declarative. Chart.js requires imperative DOM refs; D3 is overkill for five static bar charts.
- **wouter over React Router.** The app has three routes. wouter is ~2 KB vs. React Router's ~50 KB. No dynamic segments or nested layouts needed.
- **shadcn/ui for form primitives.** Pre-built accessible Select, RadioGroup, and Form components saved significant accessibility work. The tradeoff is `src/components/ui/` must not be hand-edited.
- **Accent color `#8A3BDB` on interactive elements only.** Applied to buttons, links, borders, and chart bars. Body text remains `#1a1a1a` for readability and WCAG contrast compliance.

---

## What Was Tried and Rejected

- **Express API proxy for survey data (`/api/survey/submit`, `/api/survey/results`).** The app initially used an Express backend with Drizzle ORM and Replit PostgreSQL. This was replaced with a direct Supabase frontend connection at the developer's request. Do not suggest reinstating the proxy.
- **Replit PostgreSQL as the database.** Replaced with the developer's existing Supabase project. Do not suggest switching back.
- **React Router.** wouter was chosen for its minimal footprint. Do not suggest migrating.

---

## Known Issues and Workarounds

**Issue 1: `survey_responses` table must be created manually in Supabase.**
- Workaround: `artifacts/free-time-survey/supabase-setup.sql` contains the full DDL. The developer must run it once in the Supabase SQL Editor.
- The app shows a specific error message if the table is missing (Supabase error code `42P01`).
- Do not remove the `error.code === "42P01"` check in `SurveyPage.tsx`.

**Issue 2: Free-text hobby and major fields produce fragmented aggregation.**
- Workaround: Both fields are normalized with `.toLowerCase()` before counting in `ResultsPage.tsx`.
- "Reading" and "reading" merge correctly; "reading books" and "reading" do not. This is a known limitation of the free-text design.
- Do not remove the `.toLowerCase()` normalization.

**Issue 3: No submission deduplication.**
- No workaround currently. A respondent can submit the form multiple times, producing duplicate rows.
- This is a known issue listed in the README and roadmap.

---

## Browser / Environment Compatibility

### Frontend

- **Tested browsers:** Chrome (latest), Edge (latest), Firefox (latest), Safari on iOS 16+
- **Expected support:** All modern evergreen browsers (ES2020+ features used via Vite/esbuild)
- **Known incompatibilities:** Internet Explorer is not supported. No polyfills are configured.

### Backend / Build Environment

- **OS:** Linux (NixOS on Replit; Debian on Azure build agents)
- **Node.js:** 18+ required (uses `import.meta.dirname`, ES module syntax throughout)
- **Package manager:** pnpm (workspace-aware); do not use npm or yarn
- **Environment variables required at build time:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (baked in by Vite at build)
- **Environment variables optional:** `PORT` (defaults to `3000`), `BASE_PATH` (defaults to `/`)
- **Replit-only variables:** `REPL_ID` (used to gate the Cartographer and DevBanner Vite plugins — they are skipped outside Replit automatically)

---

## Open Questions

- Should the hobby and major fields be replaced with autocomplete inputs (backed by a list of common values) to improve aggregation quality, or should they remain free-text as specified in the PRD?
- Should a soft duplicate-submission check be added (e.g., `sessionStorage` flag) before investing in a backend fingerprinting solution?
- Does the instructor want a password-protected admin view to see individual (not just aggregated) responses, or is public aggregation sufficient?
- Should the results page auto-refresh on a timer, or is manual page reload acceptable for a short-run class survey?

---

## Session Log

### 2026-04-01

**Accomplished:**
- Switched data layer from Express/Replit PostgreSQL to direct Supabase frontend connection
- Installed `@supabase/supabase-js`; created `src/lib/supabase.ts` singleton
- Rewrote `SurveyPage.tsx` and `ResultsPage.tsx` to use Supabase directly
- Fixed `vite.config.ts` to not throw on missing `PORT`/`BASE_PATH` (Azure compatibility)
- Added descriptive error message for Supabase error code `42P01` (missing table)
- Created `artifacts/free-time-survey/supabase-setup.sql`
- Created `README.md` at project root
- Created `WORKING_NOTES.md` at project root

**Left incomplete:**
- Developer has not yet run `supabase-setup.sql` in Supabase — table does not exist, so submissions and results both fail

**Decisions made:**
- Direct frontend Supabase connection (no proxy)
- Azure SWA as deployment target; `staticwebapp.config.json` retained in `public/`

**Next step:**
- Developer runs `supabase-setup.sql` in Supabase SQL Editor, then tests a live submission and results page load

---

## Useful References

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction) — `.from().insert()`, `.from().select()`, error handling
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) — how the anon INSERT/SELECT policies work
- [react-hook-form + Zod resolver](https://react-hook-form.com/get-started#SchemaValidation) — schema-based validation integration
- [shadcn/ui Form docs](https://ui.shadcn.com/docs/components/form) — `<FormField>`, `<FormItem>`, `<FormMessage>` usage patterns
- [Recharts documentation](https://recharts.org/en-US/api) — `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`
- [Azure Static Web Apps — Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration) — `staticwebapp.config.json` `navigationFallback` for SPA routing
- [Azure Static Web Apps — Build configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration) — app location, output location, build command settings
- [wouter README](https://github.com/molefrog/wouter) — `<Switch>`, `<Route>`, `<Link>`, `useLocation`
- **AI tools used:** Replit AI (agent) — used to scaffold the monorepo, build all pages, integrate Supabase, fix deployment config, generate documentation. All generated code was reviewed by the developer.
