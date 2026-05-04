# Operon (Clean Migration Foundation)
This repository is now the clean Operon foundation for a new UI build.

## Architecture

### Direct Supabase access (frontend)
The app uses Supabase directly for normal operational data:
- auth + session
- brewery profiles/context
- batches
- recipes
- inventory
- operational records

### Cloudflare Functions (special backend tasks only)
Cloudflare Functions are kept only for:
- brewery provisioning
- Notion semantic endpoints
- future special backend tasks

### Notion semantic layer
Notion is used for:
- semantic entities
- semantic links
- semantic graph
- readiness/explanation data

## Frontend structure (React + TypeScript + Vite)

- `src/lib/supabase.ts` — single Supabase client instance
- `src/api/db.ts` — typed Supabase data access layer
- `src/api/notion.ts` — typed frontend Notion semantic API client
- `src/context/AppContext.tsx` — auth/session + brewery context + demo-mode entrypoint
- `src/contexts/LanguageContext.tsx` — language foundation
- `src/types/*` — domain + permission types
- `src/config/env.ts` — environment bindings

## Cloudflare Functions structure

- `functions/_shared/auth.ts` — shared JWT verification and common JSON responses
- `functions/_shared/notion.ts` — Notion fetching + semantic normalization
- `functions/api/provision-brewery.ts`
- `functions/api/notion/health.ts`
- `functions/api/notion/entities.ts`
- `functions/api/notion/links.ts`
- `functions/api/notion/graph.ts`
- `functions/api/notion/readiness.ts`


## Deployment

- Production deployment is managed through the current Operon Cloudflare setup.
- Do not use legacy BrewOS Pages deployments for this repository.

## Environment variables

### Frontend
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Cloudflare Functions
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NOTION_API_KEY`
- `NOTION_DB_GRAPH`
- `NOTION_DB_LINKS`
- `NOTION_DB_LINKS_RELATIONAL`
- `NOTION_DB_SEMANTIC_LINKS_LEGACY` (optional)
- `NOTION_SOURCE_ID` (optional, for provisioning)

## Commands
- `npm run dev`
- `npm run gen:types`
- `npm run typecheck`
- `npm run build`

Run `npm run gen:types` after any Supabase schema change to refresh `src/types/supabase.ts`.

## Supabase Auth hook + tenant RLS setup

After applying migrations, enable the custom access token hook so `brewery_id` is present in JWT claims:

1. Open Supabase Dashboard → **Authentication** → **Hooks**.
2. Under **Custom Access Token**, select `public.custom_access_token_hook`.
3. Save changes.

Without this setting, tenant RLS policies that read `(auth.jwt() ->> 'brewery_id')::uuid` will return no rows for authenticated users.
