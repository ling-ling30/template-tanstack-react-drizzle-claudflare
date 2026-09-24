# 004 — Sidebar Smooth Deceleration & Reflow Optimization

- **Status**: DONE
- **Commit**: 9850848
- **Severity**: HIGH
- **Category**: Performance & Easing
- **Estimated scope**: 1 file (`apps/user-application/src/components/ui/sidebar.tsx`)

## Problem

The primary navigation sidebar employs `ease-linear` across multiple transition properties (`width`, `left`, `right`, `margin`), along with `transition-all` on the resizer edge.

Linear timing on large layout components feels robotic and jarring because it lacks deceleration. Furthermore, `transition-all` on the resize border (line 290) triggers unnecessary off-GPU recalculations during collapse/expand states.

```tsx
/* apps/user-application/src/components/ui/sidebar.tsx:218 — current */
className={cn(
  "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", ...
)}

/* apps/user-application/src/components/ui/sidebar.tsx:229 — current */
className={cn(
  "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex", ...
)}

/* apps/user-application/src/components/ui/sidebar.tsx:290 — current */
className="absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear ..."

/* apps/user-application/src/components/ui/sidebar.tsx:404 — current */
"flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-hidden transition-[margin,opacity] duration-200 ease-linear ..."
```

## Target

Replace `ease-linear` with responsive deceleration (`ease-out`, matching `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`), budget duration to 200ms, and replace `transition-all` with targeted `transition-[left,right,background-color]`.

```tsx
/* apps/user-application/src/components/ui/sidebar.tsx — target */
// line 218:
"relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-out";

// line 229:
"fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-out md:flex";

// line 290:
"absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-[left,right] duration-200 ease-out group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex";

// line 404:
"flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-hidden transition-[margin,opacity] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-sidebar-ring [&>svg]:size-4 [&>svg]:shrink-0";
```

## Repo conventions to follow

- Look at `apps/user-application/src/components/ui/button.tsx`: uses `duration-120 ease-out`.
- UI state movements stay under 200–250ms with decelerating curves.

## Steps

1. Open `apps/user-application/src/components/ui/sidebar.tsx`.
2. At line 218 (`sidebar-gap`): replace `ease-linear` with `ease-out`.
3. At line 229 (`sidebar-container`): replace `ease-linear` with `ease-out`.
4. At line 290 (`SidebarRail`): replace `transition-all ease-linear` with `transition-[left,right] duration-200 ease-out`.
5. At line 404 (`SidebarGroupLabel`): replace `ease-linear` with `ease-out`.

## Boundaries

- Do NOT alter sidebar widths, collapse triggers, or cookies/context state.
- Do NOT alter keyboard navigation logic (`Ctrl+B` toggle).
- Changes are strictly confined to `apps/user-application/src/components/ui/sidebar.tsx`.

## Verification

- **Mechanical**:
  - Run `pnpm --filter user-application typecheck` $\rightarrow$ passes with 0 errors.
  - Run `pnpm test` $\rightarrow$ passes all suites.
- **Feel check**:
  - Open `/dashboard` on desktop and toggle the sidebar (using button or keyboard shortcut).
  - Observe the movement: it should glide open swiftly and coast softly to a stop without linear abruptness.
- **Done when**:
  - Searching `apps/user-application/src/components/ui/sidebar.tsx` returns zero occurrences of `ease-linear` and `transition-all`.
