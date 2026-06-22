# Migration notes — Cloudflare → MySQL / Node

This pass converted the **data layer** and the **user-application runtime** off Cloudflare, per `../PRD.md` and `../ai-service-api-contract.md`. Done in the sandbox; **must be validated on your machine** (`pnpm install` + typecheck + a real DB).

## What changed

### `packages/data-ops`

- `src/drizzle/auth-schema.ts` — sqlite-core → **mysql-core**. All Better Auth fields preserved (username, ban, impersonation, org plugin); ids `varchar(36)`, timestamps `timestamp`, booleans `boolean`.
- `src/drizzle/app-schema.ts` — sqlite-core → mysql-core. Kept `organizations` + `siteSettings` shapes. **Added** `org_ai_tenant` (org → AI `client_id` mapping, widget key, allowlist, 70/90 low-credit re-arm) and `notification_log`.
- `src/database/setup.ts` — `drizzle-orm/d1` + D1 binding → **`drizzle-orm/mysql2`** + mysql2 pool (`createDatabase(url | Pool)`).
- `drizzle.config.ts` — dialect `sqlite`/`d1-http` → **`mysql`** (`DATABASE_URL`).
- `config/auth.ts` and `src/auth/server.ts` — Better Auth provider `sqlite` → **`mysql`**; dropped better-sqlite3.
- `package.json` — removed `better-sqlite3`, `@cloudflare/workers-types`; added `mysql2`.
- **Deleted** stale sqlite migration SQL + `meta/` under `src/drizzle/` (regenerate fresh — see below).

### `apps/user-application`

- `src/core/env.ts` — dropped `DB`/`PROOF_BUCKET` bindings; added `DATABASE_URL`, `STORAGE_DIR`, `SMTP_*`, `MAIL_FROM`, `AI_SERVICE_*`. Added memoized `getEnv()`. Reads `process.env`.
- `src/core/runtime.ts` — builds DB from `DATABASE_URL`, storage from `STORAGE_DIR`, auth provider `mysql`. `initRuntime()` no longer takes Cloudflare bindings.
- `src/core/storage/local-storage.ts` — **new**, filesystem object storage replacing R2 (`put/get/delete/list`).
- `src/core/email/mailer.ts` — wired to **Nodemailer + Mailgun SMTP** (was a stub).
- `src/core/ai-service/{trust,client}.ts` — **new** gateway: signed-JWT service trust + typed client (chat, credit status, knowledge query; `provisionTenant` stubbed = gap G2).
- `src/server.ts` — Node entry (dropped `ExportedHandler<Env>` / Workers signature).
- `src/routes/ready.tsx` — probe now checks MySQL (`SELECT 1`) + local storage instead of D1/R2.
- `vite.config.ts` — removed `@cloudflare/vite-plugin` (TanStack Start defaults to Node).
- `package.json` — removed `wrangler`, `@cloudflare/vite-plugin`; added `mysql2`, `nodemailer`, `@types/nodemailer`; replaced `db:migrate:local/remote` (wrangler d1) with `db:generate`/`db:migrate` (drizzle-kit); added `start`.
- `.env.example` — **new** (replaces `.dev.vars.example`, which was deleted).
- Deleted `wrangler.jsonc`, `worker-configuration.d.ts`, `.dev.vars.example`.

### `scripts/check-env.ts`

- Checks `.env` + required vars (incl. an AI-service-trust warning) instead of `.dev.vars` + wrangler bindings.

## You must do on your machine

```bash
cd main-app
pnpm install                              # picks up mysql2/nodemailer, drops sqlite/cf

cp apps/user-application/.env.example apps/user-application/.env   # fill in DATABASE_URL, BETTER_AUTH_SECRET, SMTP_*, AI_SERVICE_*

# regenerate MySQL migrations from the ported schema (old sqlite migrations were deleted)
pnpm --filter @repo/data-ops drizzle:generate
pnpm --filter @repo/data-ops drizzle:migrate   # against a running MySQL

pnpm --filter @repo/data-ops build         # data-ops compiles to dist/ (consumed by the app)
pnpm --filter user-application typecheck
pnpm dev
```

## Not done in this pass (flagged)

1. **`apps/data-service`** — still a Cloudflare Workers service (Durable Objects, Workflows, wrangler). Out of scope here. Decide: port to a Node background-jobs runner, or drop it if unused.
2. **TanStack Start Node server preset** — removing `@cloudflare/vite-plugin` makes Start default to Node/Nitro, but the exact production server output (`pnpm start` → `.output/server/index.mjs`) should be confirmed against your TanStack Start version; adjust the `start` script if the output path differs.
3. **Better Auth schema parity** — schema was hand-ported; after `drizzle:generate`, diff the generated SQL against Better Auth's expectations (run the app's sign-in flow once) to confirm no column/type drift.
4. **`provisionTenant` (gap G2)** — stubbed; implement once the AI service's provisioning contract is finalized.
5. **Obsolete `../gositus-main-app/`** — my earlier hand-scaffold. Superseded by this clone; safe to delete (sandbox couldn't remove it).
6. **Docs** (`docs/*.md`, `apps/user-application/public/docs/*`, `CLAUDE.md`) still describe the Cloudflare setup — update when convenient.
