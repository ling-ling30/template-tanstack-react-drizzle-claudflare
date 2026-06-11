# Modern SaaS Template

A production-ready, full-stack SaaS starter for **Cloudflare Workers** — typed end to end,
multi-language ready, and batteries-included. Built to be cloned and shipped, not just demoed.

> Run the app and open **`/showcase`** to see every UI component and capability live.

## 🚀 Tech stack

|                    |                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| **Framework**      | [TanStack Start](https://tanstack.com/start/latest) + React 19                                      |
| **Routing / data** | TanStack Router + TanStack Query                                                                    |
| **Auth**           | [Better Auth](https://better-auth.com/) (orgs, roles, username)                                     |
| **Database**       | [Drizzle ORM](https://orm.drizzle.team/) + Cloudflare D1                                            |
| **Storage**        | Cloudflare R2                                                                                       |
| **UI**             | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (neutral) + Radix |
| **i18n**           | [react-i18next](https://react.i18next.com/) (EN/ID)                                                 |
| **Deploy**         | [Cloudflare Workers](https://workers.cloudflare.com/)                                               |
| **Monorepo**       | [pnpm](https://pnpm.io/) workspaces                                                                 |

## ✅ What's included

**Pages** — marketing landing, `/showcase` (live component + capability gallery), org login,
an **admin dashboard** (shadcn sidebar + header, responsive via Sheet) with organization
management, an account page (name + password + sign-out), and site settings with a working
**Open Graph editor** that injects `og:*` tags into `<head>`.

**Backend** — a memoized server runtime (env-validated DB + auth, built once per isolate),
typed server functions (RPC) with **global CSRF + error middleware**, org-scoped auth + RBAC,
rate-limited auth routes, and a separate `data-service` worker with **background jobs**
(Cloudflare Workflows) and a typed **REST + OpenAPI** surface.

**Platform** — Drizzle + D1 with migrations, R2 storage, security headers + **CSP**,
health/ready probes, a transactional **email** shell with HTML templates, `/sitemap.xml`,
and `robots.txt`.

**DX** — react-i18next with a **no-hardcoded-strings** lint rule, shadcn/ui + dark mode,
Storybook, Vitest with example test patterns, husky + lint-staged, `pnpm check:env` and
`pnpm seed`, CI/CD workflows, in-repo `.claude/skills`, and full docs.

## 🏁 Quickstart

```bash
# 1. Install (also builds the shared data package via postinstall)
pnpm install

# 2. Configure local secrets
cp apps/user-application/.dev.vars.example apps/user-application/.dev.vars
#    → set BETTER_AUTH_SECRET  (openssl rand -base64 32)
pnpm check:env                                   # validate before starting

# 3. Create the local D1 database + run migrations
pnpm db:migrate:local

# 4. Start the dev server (rebuilds data-ops first via predev)
pnpm dev                                         # http://localhost:3000

# 5. (optional) Seed a master admin + demo data — dev server must be running
pnpm seed
```

Then sign in at `http://localhost:3000/login` with the seeded admin
(`owner@example.com` / `admin123456` by default — change these).

> **Note:** the app imports `@repo/data-ops` from its built `dist/`. That build runs
> automatically on `pnpm install` (`postinstall`) and before `pnpm dev` (`predev`), so a fresh
> clone just works — but you can always run `pnpm run build:data-ops` manually.

See **[docs/quickstart.md](docs/quickstart.md)** for the full command table.

## 🗺️ Pages

| Route                      | Purpose                                       | Access         |
| -------------------------- | --------------------------------------------- | -------------- |
| `/`                        | Marketing landing + feature guide             | public         |
| `/showcase`                | Live component + capability gallery           | public         |
| `/todos`                   | Mock form example (TanStack Form + server fn) | public         |
| `/sitemap.xml`             | Dynamic sitemap                               | public         |
| `/login`                   | Sign in (platform admin)                      | public         |
| `/$organizationSlug/login` | Org login                                     | public         |
| `/$organizationSlug/app`   | Organization workspace shell                  | org member     |
| `/dashboard`               | Admin dashboard shell                         | platform admin |
| `/dashboard/account`       | Profile, change password, sign out            | platform admin |
| `/dashboard/settings`      | Site settings + Open Graph editor             | platform admin |
| `/dashboard/organizations` | Organization management                       | platform admin |
| `/health`, `/ready`        | Liveness / readiness probes                   | public         |
| `/api/auth/$`              | Better Auth handler (rate-limited)            | —              |

## 🏗️ Project structure

```
apps/
  user-application/        TanStack Start app (frontend + worker)
    src/
      components/          UI (shadcn ui/, forms, layout, i18n, theme)
      core/
        auth/ functions/   Auth context/guards + server functions (RPC)
        runtime.ts env.ts  Memoized boot + validated environment
        email/ security/   Email shell + templates, headers + rate limit
        analytics/ logger/  IoC shells for your providers
      hooks/  i18n/  routes/  stories/  test/
  data-service/            Background jobs (Workflows) + REST/OpenAPI worker

packages/
  data-ops/                Shared backend (no UI)
    src/auth/ drizzle/ queries/ zod-schema/

docs/        Guides (quickstart, architecture, adding-a-feature, decisions)
.claude/skills/   In-repo skills (add-feature, add-migration, deploy, …)
```

Full design + diagrams: **[docs/architecture.md](docs/architecture.md)**.

## ✨ Core mechanisms

**Server runtime** (`core/runtime.ts`) — `initRuntime(env)` validates the environment, builds
the DB + Better Auth via the `createDatabase` / `createAuth` factories, and **memoizes** them
per worker isolate (no rebuilding auth per request). Read it anywhere on the server with
`getRuntime()`; the legacy `getDb()` / `getAuth()` singletons are still populated.

**Global CSRF + error pipeline** — `csrfAndErrorMiddleware` (`core/functions/base.ts`) is
registered globally in `src/start.ts` via `createStart({ functionMiddleware: [...] })`, so it
runs on **every** server function automatically: it checks `Origin`/`Referer` on mutations and
sanitizes unhandled errors so stack traces never leak.

**RBAC** — gate server functions with `requireOrganizationContext` / `requirePermission`, and
hide UI with `<RequirePermission allowedRoles={['admin']}>`.

**Security** — `applySecurityHeaders()` (incl. a starter **CSP**) wraps every response, and
auth routes are rate-limited (`core/security/rate-limit.ts`).

**Feedback UI** — `sonner` toasts (`toast.success(...)`), a router-driven top progress bar, and
reusable `EmptyState` / `ErrorState` / `Skeleton` states.

## 🌐 Internationalization

Multi-language via **react-i18next** (`src/i18n/`). Locales live in
`src/i18n/locales/<lng>/common.json` (EN + ID included); `<LanguageSwitcher />` persists the
choice to localStorage.

```tsx
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
return <h1>{t("app.name")}</h1>;
```

**Add a language:** create `locales/<lng>/common.json`, then register it in
`SUPPORTED_LANGUAGES` + `resources` in `src/i18n/config.ts`.

> ❗ **No hardcoded UI strings.** Every visible string goes through `t("...")`. Enforced by
> `eslint-plugin-i18next` (run `pnpm lint`); shadcn `components/ui/*` is exempt. A locale-parity
> test fails if a key is missing in any language.

## 🎨 Theming

shadcn **`neutral`** base color with CSS variables in `src/styles.css` (light + `.dark`).
Light/dark/system via the official shadcn TanStack Start `ThemeProvider`
(`components/theme/theme-provider.tsx`, FOUC-free via `ScriptOnce`) + `<ThemeToggle />`.
Tailwind v4 dark mode is enabled with `@custom-variant dark` in `styles.css`. To re-theme, swap
the variables for another shadcn theme and update `baseColor` in `components.json`.

## 🧰 Additional capabilities

- **Email** — `core/email/mailer.ts` (provider-agnostic shell, console in dev) + HTML
  templates in `core/email/templates.ts`, wired to Better Auth for verification/reset.
- **Background jobs** — durable, retrying Cloudflare Workflow in `data-service`
  (`POST /jobs/example`).
- **REST API + OpenAPI** — `data-service` `/api/v1`, spec at `/openapi.json`, Swagger at `/docs`.
- **Observability shells** — drop your SDK into `core/logger/logger.ts` /
  `core/analytics/provider.tsx` (IoC; nothing scattered through the app).
- **Storybook** — `pnpm --filter user-application storybook` (:6006).

## 🔐 Authentication

[Better Auth](https://better-auth.com/) with the `username` + `organization` plugins. Server
config: `packages/data-ops/src/auth/server.ts`. Client: `apps/user-application/src/lib/auth-client.ts`.
`PLATFORM_ADMIN_EMAILS` (env) grants access to the `/dashboard` admin area.

## 🧪 Testing

Vitest + jsdom + Testing Library. Example patterns included: a component test, a mocked-DB
query test, security/logic tests, and an i18n locale-parity test.

```bash
pnpm test          # all workspace tests
pnpm typecheck     # all packages
pnpm lint          # incl. the no-hardcoded-strings rule
```

## 🗄️ Database

Schema + migrations in `packages/data-ops/src/drizzle/`.

```bash
pnpm --filter @repo/data-ops drizzle:generate   # create a migration from schema changes
pnpm db:migrate:local                           # apply to local D1
pnpm db:migrate:remote                          # apply to remote D1
```

See the **[add-migration](.claude/skills/add-migration/SKILL.md)** skill.

## 📦 Deployment

```bash
pnpm run check:env
pnpm db:migrate:remote
pnpm run deploy:user-application          # builds data-ops, then wrangler deploy
```

CI/CD: `.github/workflows/ci.yml` (typecheck + lint + test on push/PR) and `deploy.yml`
(**manual** — run from the Actions tab once your Cloudflare resources + secrets are set up). Set repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`. Full steps
in the **[deploy](.claude/skills/deploy/SKILL.md)** skill.

## 📚 Documentation

- [docs/quickstart.md](docs/quickstart.md) — first 5 minutes
- [docs/RULEBOOK.md](docs/RULEBOOK.md) — the engineering contract (read before changing code)
- [docs/STANDARDS.md](docs/STANDARDS.md) — TypeScript, styling, forms, i18n, a11y, SEO
- [docs/architecture.md](docs/architecture.md) — system design + diagram + pages
- [docs/adding-a-feature.md](docs/adding-a-feature.md) — add a feature (full worked example)
- [docs/decisions.md](docs/decisions.md) — why key choices were made
- [CONTRIBUTING.md](CONTRIBUTING.md) — workflow, rules, testing patterns
- [docs/data-table-guide.md](docs/data-table-guide.md) — data table usage

### In-repo skills (`.claude/skills/`)

`add-feature` · `add-server-function` · `add-migration` · `add-ui-component` · `deploy` —
recipes that auto-load in Claude Code / Cowork when you ask to add a feature, migration, etc.
