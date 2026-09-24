# 006 — Progress Bar GPU Scale Transform

- **Status**: DONE
- **Commit**: 9850848
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (`apps/user-application/src/components/ui/progress-bar.tsx`)

## Problem

`<ProgressBar>` animates the layout property `width` using `transition-all`:

```tsx
/* apps/user-application/src/components/ui/progress-bar.tsx:48-52 — current */
<div
  className="bg-primary h-full transition-all duration-300 ease-out"
  style={{ width: `${progress}%` }}
/>
```

Every interval tick during route transitions forces a browser style recalculation, layout reflow, and repaint across the entire viewport. Furthermore, `transition-all` incurs performance overhead.

In AUDIT.md §5:
"Animate `transform` and `opacity` only. `width`/`height`/`margin`/`padding`/`top`/`left` trigger layout + paint + composite."

## Target

Replace `width` layout animation with GPU-accelerated horizontal scaling:

- Set element width to `w-full`
- Set `origin-left`
- Drive motion via `style={{ transform: `scaleX(${Math.min(100, Math.max(0, progress)) / 100})` }}`
- Scope transition to `transition-transform duration-300 ease-out`

```tsx
/* apps/user-application/src/components/ui/progress-bar.tsx — target */
<div
  className="bg-primary h-full w-full origin-left transition-transform duration-300 ease-out will-change-transform"
  style={{
    transform: `scaleX(${Math.min(100, Math.max(0, progress)) / 100})`,
  }}
/>
```

## Repo conventions to follow

- Hardware-accelerated CSS transforms using Tailwind v4 transform utilities (`origin-left`, `transition-transform`).

## Steps

1. Open `apps/user-application/src/components/ui/progress-bar.tsx`.
2. Locate the inner progress indicator div (lines 48–52).
3. Update `className` to:
   `"h-full w-full bg-primary origin-left transition-transform duration-300 ease-out will-change-transform"`
4. Update `style` prop from `{ width: `${progress}%` }` to:
   `style={{ transform: `scaleX(${Math.min(100, Math.max(0, progress)) / 100})` }}`

## Boundaries

- Do NOT change the parent container dimensions or z-index (`z-[100] h-1`).
- Do NOT change the router pending lifecycle hook logic.
- Changes are strictly confined to `apps/user-application/src/components/ui/progress-bar.tsx`.

## Verification

- **Mechanical**:
  - Run `pnpm --filter user-application typecheck` $\rightarrow$ passes with 0 errors.
  - Run `pnpm test` $\rightarrow$ passes all suites.
- **Feel check**:
  - Trigger page transitions by navigating between `/` and `/showcase` or `/todos`.
  - In Chrome DevTools Performance monitor, observe "Layout / sec": notice zero layout recalculations triggered by the progress bar tick.
  - Progress bar advances smoothly at 60/120fps.
- **Done when**:
  - The inner progress bar element has zero layout `width` manipulation and runs strictly on `scaleX`.
