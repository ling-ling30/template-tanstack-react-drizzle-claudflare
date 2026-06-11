# Engineering Standards

How we write code in this template. The [RULEBOOK.md](./RULEBOOK.md) is the contract; this is
the detail. Every standard maps to a real lint rule, test, or pattern in the codebase.

## TypeScript

- **Strict mode is on** (`strict: true`) — do not disable it.
- **Avoid `any`.** `@typescript-eslint/no-explicit-any` warns on it. Narrow external/unknown data
  with a zod schema instead.
- **Zod is the source of truth for shapes.** Shared schemas live in
  `packages/data-ops/src/zod-schema/`; derive types with `z.infer` rather than declaring a parallel
  `type`.
- **Avoid `as` assertions.** Prefer type guards or zod validation. A narrow cast at a typed
  boundary (e.g. a Select value to its union) is acceptable when commented.
- Path alias `@/*` → `src/*`.

## Styling & design system

- **shadcn first.** Check for an existing shadcn/ui component before building custom UI:
  `pnpm dlx shadcn@latest add <name>`. Keep `components/ui/` for primitives; feature components
  live in `components/<feature>/`.
- **No hardcoded colors.** Use theme tokens — `bg-background`, `text-foreground`,
  `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`, etc. The
  `no-restricted-syntax` ESLint rule flags raw palette utilities (`bg-zinc-500`, `text-gray-700`,
  …) in app code (`components/ui/*` exempt). This is what keeps dark mode and re-theming working.
- **Dark mode** uses the shadcn TanStack Start `ThemeProvider` (FOUC-free via `ScriptOnce`) plus
  `@custom-variant dark (&:is(.dark *))` in `styles.css`. Don't reintroduce `next-themes`.
- Base color is shadcn **`neutral`** (`components.json` + `styles.css`).
- Merge classes with `cn()` from `@/lib/utils`.

## Forms

Stack: **TanStack Form + zod (shared schema) + shadcn `Field` components + React Query + server
functions.** Reference: the `/showcase` "Forms" demo (`components/todos/todo-form.tsx`) and the
official shadcn TanStack Form guide.

### Pattern

```tsx
const form = useForm({
  defaultValues: { title: "", priority: "medium" as const },
  validators: { onChange: sharedZodSchema },   // client validation
  onSubmit: async ({ value }) => {
    try {
      await mutation.mutateAsync({ data: value }); // server re-validates
      toast.success(t("..."));
      form.reset();                                // reset only on success
    } catch {
      toast.error(t("..."));                       // keep input on failure
    }
  },
});
```

```tsx
<form.Field name="title" children={(field) => {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{t("...")}</FieldLabel>
      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}} />
```

### Hard rules

1. **Shared zod schema** from `data-ops` (or a local `zod-schema` file) — used on **both** client
   and server.
2. **Server re-validates.** The server function calls `.inputValidator((d) => schema.parse(d))`.
3. **Error display:** gate on `isTouched && !isValid`, `data-invalid` on `<Field>`,
   `aria-invalid` on the control, and pass `errors={field.state.meta.errors}` **directly** to
   `<FieldError />`. Never `String()` a zod issue — that renders `[object Object]`.
4. **Submit:** disable while submitting; reset only on success; never clear input after a failed
   submit.
5. **i18n:** every label, placeholder, and message goes through `t(...)`.

## i18n & localization

- **No hardcoded user-facing strings** — `useTranslation()` + `t("namespace.key")`. Enforced by
  `eslint-plugin-i18next`.
- Locales live in `src/i18n/locales/<lng>/common.json` (EN + ID). Add a new key to **every**
  locale — the `i18n/locales.test.ts` parity test enforces this.
- Suggested namespaces: `common` (shared actions/labels), `nav`, `account`, `errors`, plus a
  per-feature namespace as features grow.
- Error copy is keyed by `AppError.code` under the `errors` namespace; fallback to `error.message`
  if a key is missing.
- Add a language by registering it in `SUPPORTED_LANGUAGES` + `resources` in `src/i18n/config.ts`.

## Metadata & SEO

- Public routes provide Open Graph metadata; the root loader injects `og:*` from site settings
  (editable at `/dashboard/settings`).
- Authenticated/admin routes should not be indexed — add `noindex,nofollow` as you build them out.
- Keep a non-empty default OG image once you have one; `seo()` (`src/utils/seo.ts`) centralizes
  the tags.
- `/sitemap.xml` lists public routes; keep it updated when you add indexable pages.

## Error contract

- All domain/transport failures normalize to `AppError` (`packages/data-ops/src/errors.ts`):
  `{ code, message, fieldErrors? }`.
- `code` is the stable key for UI and tests; `message` is safe fallback copy.
- Build with `appError(code, message)`; check with `isAppError(value)`.
- The global server-fn middleware sanitizes unknown errors to `INTERNAL`.
- Never throw raw `Error` across a domain or transport boundary.

## Serverless data writes (Cloudflare D1)

D1 has **no interactive transactions** — `db.transaction(async (tx) => {...})` throws on Workers.
For atomicity, use **`db.batch([...])`** (D1 runs it as one SQLite transaction; all-or-nothing).

```ts
// data-ops query — atomic multi-write via batch
export async function moveItem(db: AppDatabase, input: { id: string; toListId: string; now: string }) {
  return db.batch([
    db.update(items).set({ listId: input.toListId, updatedAt: input.now }).where(eq(items.id, input.id)),
    db.insert(activity).values({ id: crypto.randomUUID(), itemId: input.id, kind: "moved", at: input.now }),
  ]);
}
```

Make writes **idempotent** (retry-safe) — Workers can retry:

```ts
// state predicate in WHERE, not a separate SELECT
db.update(orders).set({ status: "paid" }).where(and(eq(orders.id, id), eq(orders.status, "pending")));
// create-once
db.insert(rows).values(v).onConflictDoNothing();
```

Avoid module-global Maps/counters as durable state — they are per-isolate. Use D1/KV/R2/Durable
Objects for anything that must survive or be globally consistent.

## PWA

The service worker is `public/sw.js`; it's registered in production only by
`components/pwa/service-worker-registration.tsx`.

- The SW caches the **app shell + static assets** and serves `public/offline.html` when a
  navigation fails offline.
- It **never** caches `/api/`, `/_serverFn/`, `/health`, `/ready` — keep new dynamic/auth routes
  out of the cache too.
- Bump `CACHE_VERSION` in `sw.js` when the caching strategy changes; old caches purge on activate.
- Keep `manifest.json` (`name`, `theme_color`, icons, `start_url`) accurate when rebranding.
- `offline.html` must stay framework-free (works with zero JS).

## Accessibility (target WCAG 2.1 AA)

- Icon-only buttons need an `aria-label` (the showcase/todo demo does this); images need `alt`.
- Form controls use `aria-invalid` on error; `<Field>` uses `data-invalid`.
- Use semantic HTML (`<button>`, `<main>`, `<h1>`, `<ul>`/`<li>`).
- All interactive elements must be keyboard reachable; maintain ≥ 4.5:1 contrast (the neutral
  theme tokens are compliant — don't override with low-contrast custom colors).

## Testing

- Pure `data-ops` queries: unit test with a mocked `db` (`queries/organizations.test.ts`).
- Components: render + assert with Testing Library (`components/forms/field-error.test.tsx`).
- Pure logic / security: direct unit tests (`core/security/*.test.ts`).
- i18n: the locale parity test guards translation completeness.
- A failable server seam needs a contract test asserting the `AppError` `code`.

## Commands

```bash
pnpm dev                 # app (predev builds data-ops)
pnpm run build:data-ops  # rebuild shared package after editing packages/data-ops/src
pnpm typecheck           # all packages
pnpm test                # all tests
pnpm lint                # incl. no-hardcoded-strings + no-hardcoded-colors
pnpm check:env           # validate .dev.vars + bindings
```
