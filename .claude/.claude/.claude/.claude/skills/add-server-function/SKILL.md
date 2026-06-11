---
name: add-server-function
description: >-
  How to add a server function (typed RPC endpoint) in this template, with auth gating
  and zod validation. Use when the user asks to add a server function, an action, a
  mutation, or a backend endpoint for the app's own frontend.
---

# Add a server function

Server functions are the app's typed RPC layer (`createServerFn`), living in
`apps/user-application/src/core/functions/<feature>.ts`. For an external REST API instead,
see `apps/data-service` (`/api/v1`, OpenAPI). The CSRF + error middleware is applied
GLOBALLY via `src/start.ts` — do not add it per function.

## Pattern
```ts
import { createServerFn } from "@tanstack/react-start";
import { requireOrganizationContext } from "@/core/auth/context";
import { someQuery } from "@repo/data-ops/queries/<feature>";
import { someInputSchema } from "@repo/data-ops/zod-schema/<feature>";

// GET (read)
export const getThingFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: organizationSlug }) => {
    const ctx = await requireOrganizationContext(organizationSlug);
    return someQuery(ctx.db, ctx.organization.id);
  });

// POST (mutation) — validate input with zod
export const doThingFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => someInputSchema.parse(d))
  .handler(async ({ data }) => {
    const ctx = await requireOrganizationContext(data.organizationSlug);
    // optionally: await requirePermission({ ... }) for finer RBAC
    return someQuery(ctx.db, /* ... */);
  });
```

## Auth rules
- **Org-scoped:** `requireOrganizationContext(slug)` → `{ db, organization, userId, userEmail }`.
- **Finer RBAC:** `requirePermission({ userId, organizationId, resource, action })` (see `core/auth/guards.ts`).
- **Platform admin:** check `checkPlatformAdminStatusFn` / the `requirePlatformAdmin` pattern.
- **Intentionally public?** Allowed, but add a comment explaining why (see `getOrganizationBySlugFn`).

## Call it from the client
```ts
import { useQuery } from "@tanstack/react-query";
const { data } = useQuery({ queryKey: ["thing", slug], queryFn: () => getThingFn({ data: slug }) });
```

## Verify
```bash
pnpm run build:data-ops && pnpm typecheck && pnpm lint
```
