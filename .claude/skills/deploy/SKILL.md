---
name: deploy
description: >-
  How to deploy this template to Cloudflare Workers. Use when the user asks to deploy,
  ship, release, push to production, or set up CI/CD for this app.
---

# Deploy to Cloudflare Workers

## One-time setup

1. **Cloudflare resources** (names in `apps/user-application/wrangler.jsonc`):
   - D1 database (`saas_template_db`) — create with `wrangler d1 create`, paste the id into
     `wrangler.jsonc` `database_id`.
   - R2 bucket (`saas-template-storage`) — `wrangler r2 bucket create`.
2. **Secrets** (NOT in `wrangler.jsonc` `vars` — those are public):
   ```bash
   cd apps/user-application
   wrangler secret put BETTER_AUTH_SECRET
   ```
   `BETTER_AUTH_URL` and `PLATFORM_ADMIN_EMAILS` can stay in `vars` (set to prod values).

## Deploy

```bash
pnpm run check:env                 # validate config first
pnpm db:migrate:remote             # apply migrations to remote D1
pnpm run deploy:user-application   # builds data-ops, then wrangler deploy
```

## CI/CD

`.github/workflows/deploy.yml` is a **manual** deploy (run it from the Actions tab → Run
workflow). It needs repo secrets:

- `CLOUDFLARE_API_TOKEN` (Workers + D1 + R2 edit permissions)
- `CLOUDFLARE_ACCOUNT_ID`

`.github/workflows/ci.yml` runs build:data-ops → typecheck → lint → test on every PR.

## Notes

- The worker validates env on boot (`core/env.ts`); a missing secret fails fast and loudly.
- Health checks after deploy: `GET /health` (live) and `GET /ready` (D1 + R2 reachable).
