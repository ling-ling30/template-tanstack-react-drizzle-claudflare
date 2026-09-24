# 008 — Checkbox Celebratory Spring Bounce & Scale Calibration

- **Status**: DONE
- **Commit**: 9850848
- **Severity**: MEDIUM
- **Category**: Physicality & Delight
- **Estimated scope**: 2 files (`apps/user-application/src/components/ui/checkbox.tsx`, `apps/user-application/src/styles.css`)

## Problem

1. In `apps/user-application/src/components/ui/checkbox.tsx`, `<CheckboxPrimitive.Indicator>` explicitly declares `transition-none`. When toggled, the checkmark instantly teleports into view with zero animation, breaking the celebratory completion feedback defined in the design spec.
2. In `apps/user-application/src/styles.css`, `.asana-check:active` applies `transform: scale(0.9)` (a 10% squish on a 16–18px element), creating visible pixel distortion and excessive glyph crushing during click.

```tsx
/* apps/user-application/src/components/ui/checkbox.tsx:22-27 — current */
<CheckboxPrimitive.Indicator
  data-slot="checkbox-indicator"
  className="grid place-content-center text-current transition-none"
>
  <CheckIcon className="size-3.5" />
</CheckboxPrimitive.Indicator>
```

```css
/* apps/user-application/src/styles.css:242-250 — current */
.asana-check {
  transition:
    transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 150ms ease,
    border-color 150ms ease;
}
.asana-check:active {
  transform: scale(0.9);
}
```

## Target

1. Apply celebratory micro-spring animation to the indicator: checkmark enters by scaling from `scale-75` to `scale-100` with an overshoot spring over 160ms.
2. Integrate `.asana-check` onto `CheckboxPrimitive.Root` so the checkbox shell responds physically to clicks.
3. Soften `.asana-check:active` from `scale(0.9)` to `scale(0.96)` to keep geometry sharp and stable.

```tsx
/* apps/user-application/src/components/ui/checkbox.tsx — target */
<CheckboxPrimitive.Root
  data-slot="checkbox"
  className={cn(
    "peer asana-check border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary size-4 shrink-0 rounded-[4px] border shadow-xs transition-[color,background-color,border-color,box-shadow,transform] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    className
  )}
  {...props}
>
  <CheckboxPrimitive.Indicator
    data-slot="checkbox-indicator"
    className="data-[state=checked]:animate-in data-[state=checked]:zoom-in-75 data-[state=closed]:animate-out data-[state=closed]:zoom-out-75 grid place-content-center text-current transition-transform duration-160 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
  >
    <CheckIcon className="size-3.5" />
  </CheckboxPrimitive.Indicator>
</CheckboxPrimitive.Root>
```

```css
/* apps/user-application/src/styles.css — target */
.asana-check {
  transition:
    transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 150ms var(--ease-out, ease),
    border-color 150ms var(--ease-out, ease);
  will-change: transform;
}
.asana-check:active {
  transform: scale(0.96);
}
```

## Repo conventions to follow

- Look at `AUDIT.md`:
  "Checkboxes: celebratory feedback on completion. Keep press scale subtle (0.95–0.98)."
- Radix indicators support `data-[state=checked]` animation attributes via `tw-animate-css`.

## Steps

1. In `apps/user-application/src/components/ui/checkbox.tsx`:
   - Add `asana-check` to `CheckboxPrimitive.Root` class string.
   - Replace `transition-none` on `CheckboxPrimitive.Indicator` with:
     `transition-transform duration-160 ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=checked]:animate-in data-[state=checked]:zoom-in-75 data-[state=closed]:animate-out data-[state=closed]:zoom-out-75`
2. In `apps/user-application/src/styles.css`:
   - In `.asana-check:active`, change `transform: scale(0.9)` to `transform: scale(0.96)`.

## Boundaries

- Do NOT alter checkbox dimensions (`size-4`).
- Do NOT alter checkbox accessibility props or Radix form bindings.
- Changes are strictly confined to `apps/user-application/src/components/ui/checkbox.tsx` and `apps/user-application/src/styles.css`.

## Verification

- **Mechanical**:
  - Run `pnpm --filter user-application typecheck` $\rightarrow$ passes with 0 errors.
  - Run `pnpm test` $\rightarrow$ passes all suites.
- **Feel check**:
  - On `/showcase`, toggle the Asana Interactive Checkbox.
  - Clicking should produce a subtle, tactile press dip (`scale(0.96)`) followed by a clean spring bounce of the check glyph.
  - In DevTools 10% animation speed: confirm the checkmark smoothly springs from 75% to 100% scale without clipping.
- **Done when**:
  - Checkbox indicator no longer has `transition-none` and `.asana-check:active` uses 0.96.
