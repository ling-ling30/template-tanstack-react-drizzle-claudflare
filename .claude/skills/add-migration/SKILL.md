---
name: add-migration
description: >-
  How to change the database schema safely in this template (Drizzle + Cloudflare D1).
  Use when the user asks to add/alter a table or column, create a migration, or change
  the database schema.
---

# Add a database migration

Schema lives in `packages/data-ops/src/drizzle/` (`auth-schema.ts`, `app-schema.ts`).
Migrations are SQL files in the same folder, tracked by `meta/_journal.json`.

## 1. Edit the schema
Add/modify a `sqliteTable` in `packages/data-ops/src/drizzle/app-schema.ts`.

## 2. Generate the migration (preferred)
```bash
pnpm --filter @repo/data-ops drizzle:generate
```
This writes `NNNN_name.sql`, a snapshot in `meta/`, and updates `meta/_journal.json`.
(Needs `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_DATABASE_ID` / `CLOUDFLARE_D1_TOKEN` env for the
d1-http driver config.)

### Hand-writing (no creds)
If you can't run generate, create the next `NNNN_name.sql` by hand AND append an entry to
`meta/_journal.json` (copy the last entry, bump `idx`, set the `tag`). This is how the
`0002_site_settings` migration was added.

## 3. Apply it
```bash
# Local D1 (dev):
pnpm db:migrate:local
# Remote D1 (production):
pnpm db:migrate:remote
```
`wrangler d1 migrations apply` reads `migrations_dir` in `apps/user-application/wrangler.jsonc`
(points at `packages/data-ops/src/drizzle`).

## 4. Rebuild data-ops so the app sees new tables/types
```bash
pnpm run build:data-ops
```

## Rules
- One logical change per migration. Never edit an already-applied migration — add a new one.
- Keep `app-schema.ts` and the SQL in sync (generate does this for you).
- After adding a table, add queries in `queries/` and (if user-facing) follow
  `docs/adding-a-feature.md`.

## Verify
```bash
pnpm run build:data-ops && pnpm typecheck && pnpm test
```
