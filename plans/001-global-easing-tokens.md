# 001 — Global Motion & Easing Tokens

- **Status**: DONE
- **Commit**: 9850848
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (`apps/user-application/src/styles.css`)

## Problem

The design system lacks centralized, reusable motion tokens. Components across the codebase either rely on default browser curves (`ease-out`, `ease-linear`), un-tokenized ad-hoc cubic-beziers, or generic transitions that feel inconsistent and robotic.

```css
/* apps/user-application/src/styles.css:178 — current */
.asana-press,
.apple-press {
  transition:
    transform 120ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 120ms ease;
  will-change: transform;
}
```

## Target

Define standardized, high-craft easing tokens inside `@theme inline` in `apps/user-application/src/styles.css` that match Emil Kowalski's motion standards ([AUDIT.md]):

- `--ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` (strong responsive deceleration for entering UI and hover states)
- `--ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)` (fluid morphing and repositioning)
- `--ease-drawer`: `cubic-bezier(0.32, 0.72, 0, 1)` (iOS-grade sheet slide physics)
- `--ease-spring`: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy tactile press and release feedback)

```css
/* apps/user-application/src/styles.css — target in @theme inline */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
```

## Repo conventions to follow

- Theme tokens are placed inside the `@theme inline { ... }` block in `apps/user-application/src/styles.css`.
- Tailwind CSS v4 automatically maps `--ease-*` variables to utility classes like `ease-out`, `ease-in-out`, etc.

## Steps

1. In `apps/user-application/src/styles.css`, locate the `@theme inline { ... }` block (around line 126).
2. Insert the four standardized motion curves immediately before the closing brace `}`:
   ```css
   --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
   --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
   --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
   --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
   ```
3. Update `.asana-press, .apple-press` (around line 178) to consume the spring and out curve:
   ```css
   .asana-press,
   .apple-press {
     transition:
       transform 120ms var(--ease-spring),
       opacity 120ms var(--ease-out);
     will-change: transform;
   }
   ```

## Boundaries

- Do NOT touch color tokens, typography, or radius variables.
- Do NOT add external animation dependencies.
- Changes are strictly confined to `apps/user-application/src/styles.css`.

## Verification

- **Mechanical**:
  - Run `pnpm --filter user-application typecheck` $\rightarrow$ passes with code 0.
  - Run `pnpm lint` $\rightarrow$ passes with 0 errors.
- **Feel check**:
  - Open any button with `.asana-press` (e.g. on `/showcase`).
  - Press down on a button: verify tactile press responds instantly within 120ms and releases with natural deceleration.
- **Done when**:
  - The four `--ease-*` variables are defined in `@theme inline` and available across all Tailwind utility classes.
