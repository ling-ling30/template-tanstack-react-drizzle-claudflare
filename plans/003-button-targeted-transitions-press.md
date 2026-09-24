# 003 — Targeted Transitions & Press Physics on Button Primitive

- **Status**: DONE
- **Commit**: 9850848
- **Severity**: HIGH
- **Category**: Performance & Easing
- **Estimated scope**: 2 files (`apps/user-application/src/components/ui/button.tsx`, `apps/user-application/src/styles.css`)

## Problem

`<Button>` combines `transition-all duration-120 ease-out` with the custom utility class `asana-press` and an inline `active:scale-[0.97]`.

This causes three issues:

1. `transition-all` triggers style recalculations and layout paints off the GPU during hover and press states.
2. In CSS cascade, `transition-all` fights the dedicated `transition: transform 120ms cubic-bezier(...), opacity 120ms ease` defined in `.asana-press`.
3. `active:scale-[0.97]` in Tailwind conflicts with `.asana-press:active { transform: scale(0.985); }` in `styles.css`.

```tsx
/* apps/user-application/src/components/ui/button.tsx:8 — current */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-tight transition-all duration-120 ease-out asana-press active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 ...",
```

```css
/* apps/user-application/src/styles.css:176-186 — current */
.asana-press,
.apple-press {
  transition:
    transform 120ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 120ms ease;
  will-change: transform;
}
.asana-press:active,
.apple-press:active {
  transform: scale(0.985);
}
```

## Target

1. Eliminate `transition-all`. Replace with targeted property transition:
   `transition-[color,background-color,border-color,box-shadow,opacity,transform]`
2. Consolidate the active scale to Emil Kowalski's recommended tactile target: `scale(0.97)`.
3. Align `.asana-press` in `styles.css` with the 120ms spring token.

```tsx
/* apps/user-application/src/components/ui/button.tsx — target */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-tight transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-120 ease-out asana-press disabled:pointer-events-none disabled:opacity-50 outline-none ...",
```

```css
/* apps/user-application/src/styles.css — target */
.asana-press,
.apple-press {
  transition:
    transform 120ms var(--ease-spring, cubic-bezier(0.16, 1, 0.3, 1)),
    opacity 120ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
  will-change: transform;
}
.asana-press:active,
.apple-press:active {
  transform: scale(0.97);
}
```

## Repo conventions to follow

- Look at `apps/user-application/src/components/ui/scroll-area.tsx:19`:
  `transition-[color,box-shadow]`
- Targeted property lists ensure the browser only listens to composited and paint properties.

## Steps

1. In `apps/user-application/src/components/ui/button.tsx`:
   - Replace `transition-all duration-120 ease-out asana-press active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100` with:
   - `transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-120 ease-out asana-press disabled:pointer-events-none disabled:opacity-50`
2. In `apps/user-application/src/styles.css`:
   - Update `.asana-press:active, .apple-press:active` from `scale(0.985)` to `scale(0.97)`.
   - Ensure `disabled` state suppression is respected:
     ```css
     .asana-press:disabled:active,
     .apple-press:disabled:active {
       transform: none;
     }
     ```

## Boundaries

- Do NOT change button sizes (`sm`, `default`, `lg`, `icon`, `pill`).
- Do NOT change variant color tokens (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `pill`).
- Do NOT touch button slot/Radix delegation logic.

## Verification

- **Mechanical**:
  - Run `pnpm --filter user-application typecheck` $\rightarrow$ passes with 0 errors.
  - Run `pnpm test` $\rightarrow$ passes all suites.
- **Feel check**:
  - Click buttons repeatedly on `/showcase`: press should register cleanly without layout flickering.
  - Press and hold: button smoothly compresses by exactly 3% (`scale(0.97)`), then springs back cleanly on release.
- **Done when**:
  - Inspecting the button computed styles confirms `transition-property` is specific and not `all`.
