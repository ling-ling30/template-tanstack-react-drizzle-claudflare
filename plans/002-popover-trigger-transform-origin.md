# 002 — Popover Trigger Transform Origin

- **Status**: DONE
- **Commit**: 9850848
- **Severity**: HIGH
- **Category**: Physicality & origin
- **Estimated scope**: 1 file (`apps/user-application/src/components/ui/popover.tsx`)

## Problem

`<PopoverContent>` defines entry and exit scale animations (`data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95`), but fails to set `origin-(--radix-popover-content-transform-origin)`. In contrast to `<DropdownMenuContent>`, `<SelectContent>`, and `<TooltipContent>`, the popover element defaults to scaling from the geometric center of the floating panel rather than anchoring to its trigger button.

This violates Emil Kowalski's Physicality rule: popovers, dropdowns, and tooltips must scale directly from their trigger element so the user understands where the sheet originated.

```tsx
/* apps/user-application/src/components/ui/popover.tsx:36-40 — current */
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border z-50 w-auto rounded-md border p-4 shadow-md outline-none",
          className
        )}
```

## Target

Add `origin-(--radix-popover-content-transform-origin)` to `<PopoverContent>`'s default className:

```tsx
/* apps/user-application/src/components/ui/popover.tsx — target */
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border z-50 w-auto origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-none",
          className
        )}
```

## Repo conventions to follow

- Radix UI dynamically provides CSS transform-origin coordinates via `--radix-popover-content-transform-origin`.
- Look at `apps/user-application/src/components/ui/dropdown-menu.tsx:43`:
  `origin-(--radix-dropdown-menu-content-transform-origin)`
- Look at `apps/user-application/src/components/ui/select.tsx:63`:
  `origin-(--radix-select-content-transform-origin)`

## Steps

1. Open `apps/user-application/src/components/ui/popover.tsx`.
2. Locate line 37 in the `PopoverContent` component.
3. Append `origin-(--radix-popover-content-transform-origin)` into the primary classes string passed to `cn(...)`.

## Boundaries

- Do NOT touch `Popover`, `PopoverTrigger`, or `PopoverAnchor`.
- Do NOT change padding, colors, borders, or shadows of the popover.
- Changes are strictly confined to `apps/user-application/src/components/ui/popover.tsx`.

## Verification

- **Mechanical**:
  - Run `pnpm --filter user-application typecheck` $\rightarrow$ passes with 0 errors.
  - Run `pnpm test` $\rightarrow$ passes all suites.
- **Feel check**:
  - Open `/showcase` and test the `Combobox` and `PhoneInput` components (both consume `<Popover>`).
  - Click to open the Combobox dropdown: verify the panel expands outward from the button border, not from its own center.
  - In DevTools Animations panel, set speed to 10%: visually confirm the origin matches the anchor trigger point.
- **Done when**:
  - Inspecting the DOM of an open popover shows computed `transform-origin` derived from the trigger location.
