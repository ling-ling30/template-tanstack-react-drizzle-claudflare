# Quickstart — first 5 minutes

```bash
# 1. Install
pnpm install

# 2. Build the shared data package.
#    (Runs automatically on `pnpm install` (postinstall) and before `pnpm dev` (predev),
#    but you can run it manually too. The app imports @repo/data-ops from its built dist/.)
pnpm run build:data-ops

# 3. Configure local secrets
cp apps/user-application/.dev.vars.example apps/user-application/.dev.vars
#    → edit BETTER_AUTH_SECRET (run: openssl rand -base64 32)
pnpm check:env          # verify your config before starting

# 4. Create the local D1 database + run migrations (wrangler-based, no remote creds needed)
pnpm db:migrate:local

# 5. Start the app
pnpm dev                # http://localhost:3000

# 6. (optional) Seed demo data — run while the dev server is up
pnpm seed               # demo org + admin + sample parties
```

Sign in at `http://localhost:3000/login` with the seeded admin
(`owner@example.com` / `admin123456` by default — change these).

**Pages to explore:** `/` (landing), `/showcase` (live component gallery),
`/dashboard` (admin shell with sidebar + header), `/dashboard/organizations`,
`/dashboard/settings` (Open Graph editor), `/dashboard/account` (profile + password).

## Everyday commands

| Command | What |
| --- | --- |
| `pnpm dev` | Run the app (port 3000) |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint (incl. no-hardcoded-string rule) |
| `pnpm check:env` | Validate `.dev.vars` + bindings |
| `pnpm seed` | Seed demo data |
| `pnpm --filter user-application storybook` | Component playground (:6006) |
| `pnpm --filter data-service dev` | Background/API worker (open `/docs` for Swagger) |
| `pnpm deploy:user-application` | Build + deploy to Cloudflare |

## First things you'll likely change

1. **Branding/name** — `wrangler.jsonc` (`name`, db name), `src/routes/__root.tsx` (title), `src/i18n/locales/*/common.json` (`app.name`).
2. **Email provider** — drop your SDK into `src/core/email/mailer.ts`.
3. **Add a feature** — new query in `packages/data-ops/src/queries/`, a server function in
   `src/core/functions/`, a route in `src/routes/`. See `docs/architecture.md`.
