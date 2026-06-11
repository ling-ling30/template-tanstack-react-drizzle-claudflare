# Contributing

> Read **[docs/RULEBOOK.md](docs/RULEBOOK.md)** (the engineering contract) and
> **[docs/STANDARDS.md](docs/STANDARDS.md)** before changing code.


## Before you push
The pre-commit hook (husky + lint-staged) runs prettier + eslint on staged files.
CI additionally runs the full pipeline, so reproduce it locally:

```bash
pnpm run build:data-ops
pnpm typecheck
pnpm lint
pnpm test
```

## Rules that matter
- **No hardcoded UI strings.** Use `t("namespace.key")` and add the key to every locale
  in `apps/user-application/src/i18n/locales/`. The `locales.test.ts` parity test fails if
  a key is missing in one language.
- **Gate server functions.** New `createServerFn` handlers should call
  `requireOrganizationContext` / `requirePermission` unless intentionally public (and
  comment why, like `getOrganizationBySlugFn`).
- **Keep `data-ops` pure.** Queries take a `db` argument and return data — no global state.
  This makes them trivial to unit test (see `queries/parties.test.ts`).
- **Validate env additions.** New env vars go in `core/env.ts` (zod) AND `.dev.vars.example`.

## Testing patterns
- **Component:** `field-error.test.tsx` (render + assert).
- **Data query:** `queries/parties.test.ts` (mocked Drizzle db).
- **i18n parity:** `i18n/locales.test.ts`.
- **Pure logic / security:** `core/security/*.test.ts`.

## Adding a feature
See [docs/adding-a-feature.md](docs/adding-a-feature.md) for a full end-to-end walkthrough
(schema → migration → query → server function → route → i18n → test). AI agents working in
this repo can use the `.claude/skills/add-feature` skill, which encodes the same recipe.

## Adding UI components
`pnpm dlx shadcn@latest add <component>` drops it into `components/ui/`. Develop it in
isolation with Storybook (`pnpm --filter user-application storybook`) and add a `*.stories.tsx`.
