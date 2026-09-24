# 005 — Sheet Drawer Curved Transition & Duration Calibration

- **Status**: DONE
- **Commit**: 9850848
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 file (`apps/user-application/src/components/ui/sheet.tsx`)

## Problem

`<SheetContent>` utilizes a 500ms duration with `ease-in-out` on open, and an unconstrained `transition` property:

1. `ease-in-out` on drawer entrance starts slowly, making the sheet feel sluggish and unresponsive to user intent.
2. 500ms exceeds the standard UI animation budget (AUDIT.md mandates UI animations stay under 300ms; drawers between 200–350ms).
3. Plain `transition` applies transitions to all properties instead of scoping strictly to `transform` and `opacity`.

```tsx
/* apps/user-application/src/components/ui/sheet.tsx:58-60 — current */
<SheetPrimitive.Content
  data-slot="sheet-content"
  className={cn(
    "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
```

## Target

Scope to `transition-transform transition-opacity`, retune duration to 300ms on open and 200ms on close, and apply the iOS drawer curve (`--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`):

```tsx
/* apps/user-application/src/components/ui/sheet.tsx — target */
<SheetPrimitive.Content
  data-slot="sheet-content"
  className={cn(
    "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition-[transform,opacity] ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:duration-200 data-[state=open]:duration-300",
```

## Repo conventions to follow

- Look at `AUDIT.md`:
  `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1); /* iOS-like drawer curve */`
- Asymmetric timing: closing is snappy (200ms) to dismiss immediately; opening is smooth and controlled (300ms).

## Steps

1. Open `apps/user-application/src/components/ui/sheet.tsx`.
2. Locate line 59 in `SheetContent`.
3. Replace:
   `transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500`
   with:
   `transition-[transform,opacity] ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:duration-200 data-[state=open]:duration-300`

## Boundaries

- Do NOT change sheet trigger, sheet overlay, or sheet title/description components.
- Do NOT alter sheet dimensions or padding.
- Changes are strictly confined to `apps/user-application/src/components/ui/sheet.tsx`.

## Verification

- **Mechanical**:
  - Run `pnpm --filter user-application typecheck` $\rightarrow$ passes with 0 errors.
  - Run `pnpm test` $\rightarrow$ passes all suites.
- **Feel check**:
  - Open a Sheet/Drawer in the app.
  - Test opening: the drawer glides into view with crisp iOS-style deceleration and settles in 300ms.
  - Press Close / Escape: the drawer exits promptly within 200ms without lingering.
- **Done when**:
  - `data-[state=open]:duration-500` is removed and replaced by 300ms with drawer curve.
