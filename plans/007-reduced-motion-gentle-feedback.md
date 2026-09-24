# 007 — Accessible Reduced Motion Calibration

- **Status**: DONE
- **Commit**: 9850848
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file (`apps/user-application/src/styles.css`)

## Problem

`styles.css` applies a brute-force reduced-motion override:

```css
/* apps/user-application/src/styles.css:253-267 — current */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .asana-press:active,
  .apple-press:active {
    transform: none !important;
  }
}
```

Forcing `transition-duration: 0.01ms !important` across all selectors (`*`) completely nukes background color fades, border highlights, focus ring transitions, and modal opacity cross-fades. When a user with vestibular sensitivities interacts with the app, the UI feels broken, harsh, and teleports violently between states.

In AUDIT.md §6:
"Reduced motion means fewer and gentler animations, **not zero** — keep transitions that aid comprehension, remove position changes.
Hunt for: reduced-motion implementations that nuke all feedback."

## Target

Replace the indiscriminate wildcard duration wipe with a principled reduced-motion policy:

1. Suppress spatial displacements: `transform: none !important` and remove slide-in/zoom animations.
2. Force `animation-duration: 0.01ms !important` on loop/spin animations.
3. Preserve gentle (120–150ms) opacity and color transitions so users still receive clear, calming visual confirmation when interacting with controls.

```css
/* apps/user-application/src/styles.css — target */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }

  /* Suppress movement and transforms, preserve soft opacity/color cross-fades */
  .asana-press:active,
  .apple-press:active,
  .asana-check:active {
    transform: none !important;
  }

  [data-state="open"],
  [data-state="closed"] {
    animation-duration: 150ms !important;
    transform: none !important;
  }
}
```

## Repo conventions to follow

- Look at `AUDIT.md`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .element {
      animation: fade 0.2s ease;
    } /* keep opacity/color, drop movement */
  }
  ```

## Steps

1. Open `apps/user-application/src/styles.css`.
2. Locate lines 253–267 (`@media (prefers-reduced-motion: reduce)`).
3. Remove `transition-duration: 0.01ms !important;` from the `*, ::before, ::after` rule.
4. Add the transform suppression and gentle fade preservation rules detailed in Target.

## Boundaries

- Do NOT remove `scroll-behavior: auto !important;`.
- Do NOT alter normal mode transitions.
- Changes are strictly confined to `apps/user-application/src/styles.css`.

## Verification

- **Mechanical**:
  - Run `pnpm --filter user-application typecheck` $\rightarrow$ passes with 0 errors.
  - Run `pnpm lint` $\rightarrow$ passes with 0 errors.
- **Feel check**:
  - In Chrome DevTools $\rightarrow$ Rendering tab $\rightarrow$ emulate `prefers-reduced-motion: reduce`.
  - Click buttons and hover over cards: verify they do not jump or translate, but smoothly fade background/border colors.
  - Open a dialog or dropdown: verify it fades in softly without sliding or zooming across the screen.
- **Done when**:
  - Tabbing through focusable elements under reduced-motion mode shows smooth focus halos rather than harsh blink transitions.
