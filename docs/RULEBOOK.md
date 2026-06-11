# Engineering Rulebook

The engineering contract for this template: structure, boundaries, data flow, auth, errors,
i18n, styling, and tests. Adapted to how this codebase actually works — every rule below maps
to real code or a real lint/test gate.

Support docs:

- **[STANDARDS.md](./STANDARDS.md)** — TypeScript, styling, forms, i18n, a11y, SEO detail.
- **[architecture.md](./architecture.md)** — system design, request flow, pages.
- **[adding-a-feature.md](./adding-a-feature.md)** — the end-to-end feature recipe.
- **[decisions.md](./decisions.md)** — why key choices were made.

## 0. Rule precedence

When rules conflict, higher wins:

1. Security rules (§10)
2. Rulebook hard rules
3. Domain/feature specs
4. Support docs (STANDARDS, architecture)
5. Local implementation preference

A lower-precedence doc never overrides a higher rule. If a rule needs to change, change this
rulebook first.

## 1. Principles

- Keep the SSR/client boundary explicit.
- Keep server work (db, auth, secrets) on the server.
- Keep UI thin, reusable, and translated.
- Validate input with zod at every trust boundary — twice (client + server) for forms.
- Prefer one canonical path over duplicated local rules.
- Verify cheaply (typecheck, test, lint) rather than guess.

## 2. Stack map

```
apps/user-application/src/
  routes/                 file-based routes (client-safe)
  components/             UI — ui/ (shadcn), feature blocks, forms, i18n, theme
  hooks/                  React Query hooks (one per domain)
  core/
    functions/            server functions (createServerFn) — the RPC seam
    runtime.ts env.ts     memoized boot + validated env
    auth/                 context + permission guards
    security/ email/      headers + rate limit, mailer + templates
    logger/ analytics/    IoC observability shells
  i18n/                   react-i18next config + locales
apps/data-service/        background jobs (Workflows) + REST/OpenAPI worker
packages/data-ops/src/
  drizzle/                schema + migrations
  queries/                reusable DB queries (pure: take db, return data)
  zod-schema/             shared validation schemas
  auth/                   Better Auth setup
```

## 3. Boundary rules

- Routes, components, and hooks stay **client-safe**.
- Server-only access (db, auth, request, secrets) lives in `core/functions/*.ts` (server
  functions) or `packages/data-ops`. Do **not** import `@tanstack/react-start/server`,
  `cloudflare:workers`, or `@repo/data-ops/queries/*` from routes/components/hooks.
- The client talks to the server **only** through server functions (`createServerFn`) called
  inside React Query `queryFn` / `mutationFn`.
- No direct DB access from app code — **all** DB calls live in `packages/data-ops/src/queries/`.

**Hard rule:** if a failure crosses a transport or domain boundary, it must be an `AppError`
(see §6), never a raw `Error`.

## 4. Data fetching & query rules

- UI fetches through hooks; hooks use **TanStack Query**.
- `queryFn` / `mutationFn` call a server function from `core/functions/`.
- Server functions read db/auth via `getRuntime()` / `getDb()` / `getAuth()` and call
  `packages/data-ops` queries.
- Queries in `data-ops` are **pure**: they take a `db` argument and return data, with no module
  globals — this is what makes them unit-testable (see `queries/organizations.test.ts`).
- A mutation must invalidate **every** affected query key (list, detail, dashboard).
- Do not use optimistic updates for state that must be authoritative (status, money, counts).

**Hard rule:** all DB calls stay in `packages/data-ops/src/queries/`.

## 5. Auth, session & CSRF rules

- Auth is **server-side**. Org resolution + permission checks happen in server functions via
  `requireOrganizationContext(slug)` → `{ db, organization, userId, userEmail }`, and finer
  RBAC via `requirePermission({ userId, organizationId, resource, action })`.
- Platform-admin access uses `checkPlatformAdminStatusFn` / the `requirePlatformAdmin` pattern,
  gated on `PLATFORM_ADMIN_EMAILS`.
- Client-side auth checks (e.g. `<RequirePermission>`) are **UX only** — never the security boundary.
- CSRF + error handling run **globally** on every server function via `csrfAndErrorMiddleware`
  registered in `src/start.ts`. Do not re-add it per function.
- Auth mutation routes are rate-limited (`core/security/rate-limit.ts`).

**Hard rule:** every state-changing server function must gate on auth (org context or platform
admin). A function may be intentionally public, but it must say so in a comment explaining why
(see `getOrganizationBySlugFn`).

## 6. Error contract rules

- Domain/transport failures normalize to an **`AppError`** (`packages/data-ops/src/errors.ts`):
  `{ code, message, fieldErrors? }`. `code` is the stable key for UI + tests; `message` is safe
  fallback copy.
- Build them with `appError(code, message)`; detect with `isAppError(value)`.
- The global middleware sanitizes unknown thrown values to `INTERNAL` so internal messages /
  stack traces never reach the client.
- User-facing error copy is translated by code via the `errors` i18n namespace
  (`getErrorMessage` / `t("errors.<CODE>")`).
- Tests assert `code`, not prose.

**Hard rule:** never let a raw `Error` name or internal message become the public contract.

## 7. i18n rules

- **No hardcoded user-facing strings.** All visible copy goes through `t("namespace.key")`.
- Add every key to **every** locale in `src/i18n/locales/<lng>/common.json`. The
  `i18n/locales.test.ts` parity test fails on a missing key.
- Enforced at lint time by `eslint-plugin-i18next` (`i18next/no-literal-string`); `components/ui/*`
  is exempt (generic primitives).
- Error UI maps translated messages from `error.code`; fallback copy stays safe if a key is missing.

**Hard rule:** do not ship new UI copy as raw strings.

## 8. Styling & component rules

- **shadcn first.** Check for a shadcn/ui component before building custom UI
  (`pnpm dlx shadcn@latest add <name>`). Reserve `components/ui/` for primitives.
- **No hardcoded colors.** Use theme tokens (`bg-background`, `text-muted-foreground`,
  `border-border`, …), never palette utilities (`bg-zinc-500`, `text-gray-700`). Enforced by the
  `no-restricted-syntax` color rule (`components/ui/*` exempt). This is what keeps dark mode and
  re-theming working.
- Dark mode uses the shadcn TanStack Start `ThemeProvider` (`ScriptOnce`, FOUC-free) + the
  `@custom-variant dark` declaration in `styles.css`. Don't mix in `next-themes`.
- Lift repeated UI into shared components; don't over-abstract a one-off.

## 9. Forms rules

Stack: **TanStack Form + zod (shared schema) + shadcn `Field` components**. Follow
[STANDARDS.md → Forms](./STANDARDS.md) and the shadcn TanStack Form pattern:

- Validate with the shared `data-ops` zod schema on the client; **re-validate the same schema on
  the server** in the server function.
- Show errors with `isInvalid = field.state.meta.isTouched && !field.state.meta.isValid`,
  `data-invalid` on `<Field>`, `aria-invalid` on the control, and
  `<FieldError errors={field.state.meta.errors} />` (pass the errors array directly — do not
  `String()` a zod issue, that yields `[object Object]`).
- Disable submit while submitting; reset **only** after a successful create, never after a failed
  submit; translate all labels, placeholders, and messages.

## 10. Security defaults

- **Default deny.** New mutating surfaces require an explicit auth gate.
- Client authorization is UX only.
- Public routes are read-only by default.
- Security headers + a starter CSP wrap every response (`core/security/headers.ts`); CSP is
  applied in production only (it would break Vite HMR in dev).
- Validate env on boot (`core/env.ts`) — a missing secret fails fast and loudly.

**Hard rule:** security defaults are the starting point unless a higher-precedence rule says otherwise.

## 11. Database & migration rules

- App tables live in `packages/data-ops/src/drizzle/app-schema.ts`. Never hand-edit the generated
  `auth-schema.ts`.
- Schema changes require a migration (`drizzle:generate`) + journal entry, then
  `build:data-ops`. Apply with `db:migrate:local` / `db:migrate:remote`.
- Keep zod schemas in sync with the DB + API shape.
- One logical change per migration; never edit an already-applied migration — add a new one.

**Hard rule:** no app-layer direct DB writes.

## 11a. Serverless / Cloudflare Workers rules

This app runs on Workers (V8 isolates, not Node). Code must stay edge-safe and isolate-safe.

- **No interactive transactions.** Cloudflare **D1 does not support** `BEGIN ... COMMIT` with JS
  logic in between, so Drizzle's callback `db.transaction(async (tx) => { ... })` **throws** on
  D1. Do not use it. For atomic multi-statement writes, use **`db.batch([...])`** — D1 runs a
  batch as a single SQLite transaction (sequential, all-or-nothing; one failure rolls back the
  batch). Build the statements in a `data-ops` query and return them, or execute the batch there.
- **Writes must be idempotent / retry-safe.** Workers can retry a request. Use state predicates
  in the `WHERE` clause (`UPDATE ... WHERE status = 'pending'`) and `INSERT OR IGNORE` /
  `onConflictDoNothing` for create-once rows. Never rely on a separate `SELECT` then `UPDATE` as
  the safety mechanism — it races.
- **No long-lived in-isolate state as truth.** Module globals (Maps, counters, caches) are
  per-isolate and evaporate. They are fine as a best-effort cache; they are **not** durable state.
  For durable/global state use D1, KV, R2, or a Durable Object. (The default rate limiter and the
  mock todos are per-isolate by design and documented as such.)
- **No Node-only runtime APIs** on the request path: no `fs`, `net`, `child_process`,
  `__dirname`, `process.cwd()`. `nodejs_compat` covers common shims, but prefer Web APIs
  (`fetch`, `crypto.randomUUID`, `Request`/`Response`).
- **No blocking/CPU-heavy work in the request.** Offload to a Workflow / Queue
  (`apps/data-service`). Respect Workers CPU-time limits.
- Read config from validated `env` (`core/env.ts`) / `getRuntime()`, never `process.env` at
  runtime.

**Hard rule:** never use `db.transaction()` (interactive) on D1 — use `db.batch()` for atomicity,
and make every write idempotent.

## 11b. PWA rules

The app ships a service worker (`public/sw.js`) + manifest. Keep it correct as you add features.

- **Never cache auth/data/dynamic routes.** The SW must continue to bypass `/api/`,
  `/_serverFn/`, `/health`, `/ready` (and any new dynamic/SSR data route). Caching those would
  serve stale or cross-user data. Only the app shell + static assets are cached.
- **Bump `CACHE_VERSION` in `sw.js`** whenever the cached shell/asset strategy changes, so old
  caches are purged on deploy. Static asset URLs are content-hashed by the build, so app-shell
  versioning is the thing to watch.
- **Register in production only.** A service worker fights Vite HMR in dev; keep the
  `import.meta.env.DEV` guard in `service-worker-registration.tsx`.
- **Keep `offline.html` framework-free.** It must render with zero JS (it's the fallback when the
  app can't load).
- **Keep the manifest accurate** (`name`, `theme_color`, icons, `start_url`) when you rebrand.
- PWA text is UI copy — it goes through i18n like everything else.

**Hard rule:** the service worker must never cache authenticated or server-function responses.

## 12. Testing rules

- A server function that can fail needs a contract test asserting the `AppError` `code`.
- Pure query logic is tested with a mocked `db` (see `queries/organizations.test.ts`).
- New locale keys are covered by the parity test automatically.
- Keep tests next to the layer they verify.

**Hard rule:** if a server seam can fail, it needs a contract test.

## 13. Tooling

- Use `graphify` for architecture / ownership / cross-module questions (`python -m graphify update .`
  after code changes).
- Use focused tests and the browser for verification; prefer live verification over guessing.
- Choose the smallest tool that answers the question.

## 14. Definition of done

A feature slice is done when:

- [ ] boundaries respected (no server imports in client-safe code; no app-layer DB access)
- [ ] every mutating server function is auth-gated (or documented as intentionally public)
- [ ] mutation invalidation covers all affected query keys
- [ ] the `AppError` contract is applied for failures
- [ ] i18n applied for all user-facing copy (keys in every locale)
- [ ] no hardcoded colors; shadcn used where available
- [ ] contract tests exist for failable server seams
- [ ] `pnpm run build:data-ops && pnpm typecheck && pnpm test && pnpm lint` all pass

**Hard rule:** not done until the checklist passes or is explicitly waived with a note in `docs/decisions.md`.

## 15. Exceptions

Any exception to this rulebook is recorded in `docs/decisions.md` with the reason. A local
exception does not become a new default. If a rule changes, update this rulebook first, then the
support docs.
