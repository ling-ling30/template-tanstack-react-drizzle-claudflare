---
name: add-feature
description: >-
  How to add a new feature to this TanStack Start + Drizzle + Cloudflare template.
  Use when the user asks to add a feature, page, table, entity, CRUD, route, or
  server function — it gives the layer-by-layer recipe (schema → migration → zod →
  query → server function → hook → route → i18n → test) used throughout this codebase.
---

# Add a feature to this template

This is a pnpm monorepo with strict layering. A feature flows from the database up to
the UI, type-safe at every step. Follow these layers in order. The full worked example
(a "Notes" feature) lives in `docs/adding-a-feature.md` — read it for copy-paste code.

## Layers (in order)

1. **Table** — `packages/data-ops/src/drizzle/app-schema.ts` (Drizzle `sqliteTable`).
2. **Migration** — `pnpm --filter @repo/data-ops drizzle:generate` (preferred), then
   `drizzle:migrate`. If hand-writing SQL, also add a `meta/_journal.json` entry.
3. **Validation** — `packages/data-ops/src/zod-schema/<feature>.ts` (zod input schema).
4. **Queries** — `packages/data-ops/src/queries/<feature>.ts`. MUST be pure: take a `db`
   argument, return data, no module globals. Then run `pnpm run build:data-ops`.
5. **Server functions** — `apps/user-application/src/core/functions/<feature>.ts` using
   `createServerFn`. GATE mutations with `requireOrganizationContext` /
   `requirePermission` (or comment why a function is intentionally public). CSRF + error
   middleware is global via `src/start.ts` — do NOT add it per function.
6. **Hook** (optional) — `apps/user-application/src/hooks/use-<feature>.ts` (React Query).
7. **Route + UI** — `apps/user-application/src/routes/.../<feature>.tsx`. Auto-registers in
   `routeTree.gen.ts` on next dev/build.
8. **i18n** — add keys to EVERY locale in `apps/user-application/src/i18n/locales/*/common.json`.
   NEVER hardcode UI strings; use `useTranslation()` + `t("...")`. The `locales.test.ts`
   parity test and the `i18next/no-literal-string` ESLint rule enforce this.
9. **Test** — at least one test (e.g. a query test with a mocked `db`; see
   `packages/data-ops/src/queries/parties.test.ts`).

## Hard rules
- Queries are pure and `db`-injected (testable).
- Server-function mutations are auth-gated unless explicitly public (and commented).
- No hardcoded UI strings — translate via i18next, key present in all locales.
- New env vars go in `core/env.ts` (zod) AND `.dev.vars.example`.

## Verify before done
```bash
pnpm run build:data-ops && pnpm typecheck && pnpm test && pnpm lint
```
All must pass (0 typecheck errors, 0 lint errors, locale parity test green).

## Reference implementations in this repo
- `site_settings` (settings page + Open Graph): schema → query → server fn → route → head injection.
- `parties` / `documents`: org-scoped CRUD with data tables.
