# Adding a feature

This template separates concerns into clear layers. A typical feature touches each one,
top (database) to bottom (UI), all type-safe. This guide walks through a complete example.

## The layers

```
packages/data-ops/          ← shared backend (no UI)
  drizzle/app-schema.ts        1. table
  drizzle/NNNN_*.sql           2. migration
  zod-schema/<feature>.ts      3. validation
  queries/<feature>.ts         4. DB queries (take `db`, return data — pure)

apps/user-application/src/
  core/functions/<feature>.ts  5. server functions (auth + call queries)
  hooks/use-<feature>.ts       6. React Query hook (optional)
  routes/.../<feature>.tsx     7. route + UI
  i18n/locales/*/common.json   8. translated strings (NO hardcoded text)
  **/<feature>.test.ts(x)      9. tests
```

> The `site_settings` feature (settings page + Open Graph) was built exactly this way —
> read those files alongside this guide for a real reference.

---

## Worked example: a "Notes" feature

A minimal org-scoped notes list. Each step shows the file and the key code.

### 1. Table — `packages/data-ops/src/drizzle/app-schema.ts`
```ts
export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull(),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("notes_org_idx").on(table.organizationId)],
);
```

### 2. Migration — `packages/data-ops/src/drizzle/NNNN_notes.sql`
Generate it (needs Cloudflare creds) or hand-write it + add a `meta/_journal.json` entry:
```bash
pnpm --filter @repo/data-ops drizzle:generate   # preferred
# then apply locally:
pnpm --filter @repo/data-ops drizzle:migrate
```
```sql
CREATE TABLE `notes` (
  `id` text PRIMARY KEY NOT NULL,
  `organization_id` text NOT NULL,
  `body` text NOT NULL,
  `created_at` text NOT NULL
);
```

### 3. Validation — `packages/data-ops/src/zod-schema/notes.ts`
```ts
import { z } from "zod";

export const createNoteInputSchema = z.object({
  organizationSlug: z.string().min(1),
  body: z.string().min(1).max(2000),
});
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;
```

### 4. Queries — `packages/data-ops/src/queries/notes.ts`
Pure: take `db`, return data. This is what makes them trivially testable.
```ts
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/database/setup";
import { notes } from "@/drizzle/app-schema";

export async function listNotes(db: AppDatabase, organizationId: string) {
  return db.select().from(notes).where(eq(notes.organizationId, organizationId));
}

export async function createNote(
  db: AppDatabase,
  input: { id: string; organizationId: string; body: string; now: string },
) {
  await db.insert(notes).values({
    id: input.id,
    organizationId: input.organizationId,
    body: input.body,
    createdAt: input.now,
  });
  return { id: input.id };
}
```

Rebuild the package so the app sees the new exports:
```bash
pnpm run build:data-ops
```

### 5. Server functions — `apps/user-application/src/core/functions/notes.ts`
**Always gate mutations** with `requireOrganizationContext` / `requirePermission`
(or document why a function is intentionally public).
```ts
import { createServerFn } from "@tanstack/react-start";
import { createNote, listNotes } from "@repo/data-ops/queries/notes";
import { createNoteInputSchema } from "@repo/data-ops/zod-schema/notes";
import { requireOrganizationContext } from "@/core/auth/context";

export const listNotesFn = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: organizationSlug }) => {
    const ctx = await requireOrganizationContext(organizationSlug);
    return listNotes(ctx.db, ctx.organization.id);
  });

export const createNoteFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => createNoteInputSchema.parse(d))
  .handler(async ({ data }) => {
    const ctx = await requireOrganizationContext(data.organizationSlug);
    return createNote(ctx.db, {
      id: crypto.randomUUID(),
      organizationId: ctx.organization.id,
      body: data.body,
      now: new Date().toISOString(),
    });
  });
```
> CSRF + error handling apply automatically (registered globally in `src/start.ts`) — you
> don't need to wire middleware per function.

### 6. Hook (optional) — `apps/user-application/src/hooks/use-notes.ts`
```ts
import { useQuery } from "@tanstack/react-query";
import { listNotesFn } from "@/core/functions/notes";

export function useNotes(organizationSlug: string) {
  return useQuery({
    queryKey: ["org", organizationSlug, "notes"],
    queryFn: () => listNotesFn({ data: organizationSlug }),
  });
}
```

### 7. Route + UI — `apps/user-application/src/routes/$organizationSlug/app/notes.tsx`
Use `useTranslation()` — **no hardcoded strings**.
```tsx
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useNotes } from "@/hooks/use-notes";

export const Route = createFileRoute("/$organizationSlug/app/notes")({
  component: NotesPage,
});

function NotesPage() {
  const { t } = useTranslation();
  const { organizationSlug } = useParams({ from: "/$organizationSlug/app/notes" });
  const { data } = useNotes(organizationSlug);
  return (
    <section>
      <h1 className="text-2xl font-semibold">{t("notes.title")}</h1>
      <ul>{data?.map((n) => <li key={n.id}>{n.body}</li>)}</ul>
    </section>
  );
}
```

### 8. Translations — `apps/user-application/src/i18n/locales/{en,id}/common.json`
Add the key to **every** locale (the `locales.test.ts` parity test enforces this):
```json
{ "notes": { "title": "Notes" } }   // en
{ "notes": { "title": "Catatan" } } // id
```

### 9. Test — `packages/data-ops/src/queries/notes.test.ts`
```ts
import { describe, expect, it, vi } from "vitest";
import { createNote } from "./notes";
import type { AppDatabase } from "@/database/setup";

describe("createNote", () => {
  it("inserts and returns id", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    const db = { insert: vi.fn(() => ({ values })) } as unknown as AppDatabase;
    const r = await createNote(db, { id: "n1", organizationId: "o1", body: "hi", now: "t" });
    expect(values).toHaveBeenCalled();
    expect(r).toEqual({ id: "n1" });
  });
});
```

---

## Final check
```bash
pnpm run build:data-ops
pnpm typecheck   # 0 errors
pnpm test        # all pass (incl. locale parity)
pnpm lint        # 0 errors (no hardcoded strings)
```
The new route auto-registers in `routeTree.gen.ts` on the next `pnpm dev`/`build`.

## Rules recap
- **Queries stay pure** (take `db`, no globals) → easy to test.
- **Gate server functions** with auth unless intentionally public (and say so in a comment).
- **No hardcoded UI strings** — `t("...")`, key in every locale.
- **New env vars** → add to `core/env.ts` (zod) AND `.dev.vars.example`.
