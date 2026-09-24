# Decision records

Short "why" notes so future you (or contributors) don't re-litigate settled choices.

## Memoized runtime over per-request init

`initRuntime()` builds DB + auth once per worker isolate and caches it. The original
template rebuilt the Better Auth instance on every request — wasteful and a subtle
shared-state risk. Factories (`createAuth`/`createDatabase`) keep it testable; the legacy
`getDb()`/`getAuth()` singletons are still populated for backwards compatibility.

## Global server-fn middleware via `src/start.ts`

CSRF + error handling is registered with `createStart({ functionMiddleware: [...] })` so it
applies to EVERY server function automatically. The original attached it to an unused
`baseServerFn`, so it never actually ran.

## react-i18next + no-hardcoded-strings

Multi-language readiness from day one is cheaper than retrofitting. The ESLint rule
(`i18next/no-literal-string`) keeps it enforced; `ui/` primitives are exempt.

## shadcn `neutral` base color

The literal shadcn default. Swap variables in `styles.css` + `components.json` baseColor
for another theme.

## Rate limiter: in-memory by default

Zero-config and good enough for basic abuse protection. It's per-isolate, NOT global — for
accurate distributed limits, back `checkRateLimit` with KV or a Durable Object; the call
signature stays the same so wiring doesn't change.

## REST API in `data-service`, separate from server functions

Server functions are typed RPC for this app's own frontend. The `/api/v1` Hono+OpenAPI
surface exists for EXTERNAL callers. Keeping them separate avoids forcing one model to do
both jobs.

## CSP ships with `'unsafe-inline'`

SSR injects inline style/script tags, so a strict policy would break rendering out of the
box. The starter CSP is conservative but permits inline; move to nonce-based CSP after
auditing inline usage.

## Better Auth's `organization` is the only org table

The template used to keep an app-level `organizations` table next to Better Auth's
`organization`. Platform-created orgs lived only in the app table, while `member` rows point at
Better Auth's table, so adding members failed the foreign key and no org ever had an owner.
Better Auth now owns tenants, membership and roles. Platform-only state (`status`) is an
`additionalFields` column users can't set (`input: false`). Migration `0003` copies legacy rows
across before dropping the old table.

## Self-serve organizations

Users sign up (`/signup`) and create their own org (`/onboarding`), becoming its `owner`.
Platform admins oversee orgs (list, disable) but do not create them and get no implicit
access inside an org.

## Membership and roles are enforced server-side

`requireOrganizationContext` requires active-org membership and returns the caller's role;
`requirePermission` authorizes that role via `roleCan` (pure, unit-tested). Custom roles passed to
Better Auth replace its defaults, so owner, admin and member are all defined in `access-control.ts`.

## The error pipeline only lets AppErrors out

TanStack Start serializes whatever a server function throws, including an Error's `cause`. The
global middleware now passes `AppError`s and router control flow (redirect/notFound) through,
maps `ZodError` to `VALIDATION_FAILED` with field errors, and replaces anything else with a bare
`INTERNAL` error. The original error is logged on the server only.
