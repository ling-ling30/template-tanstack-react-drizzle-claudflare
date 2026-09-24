---
name: asana-design
description: Asana's design system and fluid productivity engineering translated for modern web applications. Use when building or reviewing clean productivity interfaces, high-density workspaces, TWK Lausanne typography, OKLCH neutral and coral palettes, 4px spatial cadence, snappy micro-interactions (<160ms), celebratory feedback, and strict @shadcn/lint compliance.
---

# Asana Design System & Engineering Guide

How to build high-performance, focused web interfaces inspired by Asana's design language ([designmd.co/d/asana](https://www.designmd.co/d/asana)) and modern Swiss productivity engineering.

This system combines **calm, high-contrast visual architecture** with **fluid, physical interaction engineering** (instant pointer response, interruptible springs, momentum projection) and strict **`@shadcn/lint` enforcement**.

---

## 1. Core Brand Philosophy & Design Principles

The Asana design system is built for **clarity, focus, speed, and collaborative momentum**:

1. **Calm Productivity Canvas**: The interface recedes into the background so user work, tasks, visual media, and project data take center stage. High-contrast typography on clean, neutral surfaces (pure white in light mode, deep obsidian slate in dark mode).
2. **Intentional Accent Energy**: Asana's iconic coral accent (`#f06a6a` / `oklch(0.67 0.19 22.5)`) is reserved for primary focal actions, key milestones, celebratory checkmarks, active focus rings, and high-priority indicators. It is never over-distributed as background filler.
3. **Strict 4px Spatial Cadence**: Every dimension, gap, padding, margin, and height derives from the 4px baseline rhythm (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`). Arbitrary values (e.g. `p-[13px]`, `gap-[7px]`) are prohibited.
4. **Crisp, Modular Geometry**: Controlled, ergonomic corner radii (`rounded-md` 6px, `rounded-lg` 8px, max `rounded-xl` 12px for dialogs) rather than oversized bubbles or rounded pills, maximizing information density and visual structure.
5. **Tactile & Snappy Feedback**: Fast micro-interactions (< 160ms) with subtle spring releases (`scale(0.985)` on press), celebratory checkbox completion states, and 0-latency pointer-down response.

---

## 2. Spatial Grid & Component Metrics (4px Rhythm)

All layout measurements, paddings, gaps, and margins are strictly derived from the **4px / 8px spatial grid**. Arbitrary values are prohibited and enforced via `@shadcn/lint`.

| Step                 | Pixels | Rem       | Tailwind Utility            | Semantic Application                                     |
| :------------------- | :----- | :-------- | :-------------------------- | :------------------------------------------------------- |
| **xxs (Micro)**      | `4px`  | `0.25rem` | `p-1`, `gap-1`, `space-y-1` | Badge insets, icon alignment gaps, tag padding           |
| **xs (Compact)**     | `8px`  | `0.5rem`  | `p-2`, `gap-2`, `space-y-2` | Toolbars, dropdown menus, icon buttons, list item gaps   |
| **sm (Control)**     | `12px` | `0.75rem` | `p-3`, `gap-3`, `space-y-3` | Compact cards, vertical form stacks, notification toasts |
| **md (Standard)**    | `16px` | `1.0rem`  | `p-4`, `gap-4`, `space-y-4` | Container padding, card bodies, table row rhythm         |
| **lg (Comfortable)** | `24px` | `1.5rem`  | `p-6`, `gap-6`, `space-y-6` | Panel padding, modal content, section internal gaps      |
| **xl (Macro)**       | `32px` | `2.0rem`  | `p-8`, `gap-8`, `space-y-8` | Section interior separation, hero callouts, empty states |
| **2xl (Section)**    | `48px` | `3.0rem`  | `py-12`, `py-16`            | Major page section dividers, landing transitions         |

### Standardized Component Metrics & Geometry

- **Buttons**:
  - Small: `h-8 px-3 text-xs rounded-md` (compact toolbars)
  - Default: `h-9.5 px-4 text-sm rounded-md font-medium` (standard actions)
  - Large: `h-11 px-5 text-sm sm:text-base rounded-lg font-medium` (primary CTA / hero actions)
  - Icon: `size-9 rounded-md`
- **Input Fields & Textareas**: `h-9.5 px-3 py-2 text-sm rounded-md border-input bg-background focus-visible:ring-2 focus-visible:ring-primary/20`
- **Cards & Task Panels**: `p-5 sm:p-6 rounded-lg border border-border/80 bg-card shadow-xs hover:shadow-sm transition-shadow`
- **Badges & Tags**:
  - Pill status tag: `h-5 px-2 text-xs font-medium rounded-full border`
  - Compact task tag: `h-5 px-1.5 text-xs font-medium rounded-sm`
- **Data Table Cells**:
  - `TableHead`: `h-10 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider`
  - `TableCell`: `px-4 py-3 text-sm`
- **Dialogs & Drawers**: `p-6 gap-4 rounded-xl max-w-lg border border-border bg-card shadow-lg`
- **Dropdown & Select Popovers**: `p-1 rounded-lg border border-border bg-popover shadow-md`

---

## 3. Asana Color System & Dynamic OKLCH Tokens

The color system adapts to Light and Dark themes via OKLCH CSS variables. **Never use raw hex codes or arbitrary palette colors in JSX.**

### Light Mode (Asana Crisp Workspace)

- `--background`: `#ffffff` (`oklch(1 0 0)`) — clean, glare-free white canvas.
- `--foreground`: `#1e1f21` (`oklch(0.20 0.01 260)`) — deep slate charcoal for optimal contrast and readability.
- `--card` / `--card-foreground`: `#ffffff` on `#1e1f21` — crisp elevated content panels.
- `--secondary`: `#f6f8f9` (`oklch(0.975 0.005 240)`) — soft cool-tinted grey for subtle structure.
- `--muted` / `--muted-foreground`: `#f6f8f9` / `#646f79` (`oklch(0.53 0.02 245)`) — readable secondary metadata.
- `--border` / `--input`: `#e8ecee` (`oklch(0.935 0.005 240)`) — fine, clean architectural divider line.
- `--ring`: Asana coral halo `oklch(0.67 0.19 22.5 / 35%)` — accessible, energetic focus indicators.

### Dark Mode (Asana Slate Night)

- `--background`: `#151617` (`oklch(0.16 0.005 260)`) — rich, deep workspace slate.
- `--foreground`: `#f5f6f7` (`oklch(0.97 0.005 240)`) — crisp white/light text.
- `--card` / `--card-foreground`: `#222325` (`oklch(0.22 0.005 260)`) — elevated dark panels.
- `--secondary`: `#2a2b2e` (`oklch(0.26 0.005 260)`) — subtle contrast insets.
- `--muted-foreground`: `#9ca6af` (`oklch(0.70 0.01 245)`) — subdued captions and icons.
- `--border` / `--input`: `oklch(1 0 0 / 12%)` — clean low-intensity separators.

### Brand & Functional Accents

- `--primary`: Asana Charcoal Slate `#1e1f21` (Light) / `#f5f6f7` (Dark) — authoritative primary actions.
- `--accent` / `--coral`: Asana Coral `#f06a6a` (`oklch(0.67 0.19 22.5)`) — signature brand energy, hero CTAs, and active marks.
- `--success`: `#28a745` (`oklch(0.63 0.17 145)`) — task complete, active deployment, healthy system.
- `--warning`: `#f59e0b` (`oklch(0.75 0.17 65)`) — at-risk status, approaching quota, notice.
- `--destructive`: `#f06a6a` (`oklch(0.67 0.19 22.5)`) — irreversible actions, deletion alerts.
- `--info`: `#00b2ff` (`oklch(0.70 0.17 220)`) — updates, system links, informational cues.

---

## 4. Typography (TWK Lausanne & Swiss Precision)

- **Font Family**: `"TWK Lausanne", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
- **Characteristics**: Crisp Swiss geometry, open counters, humanist warmth, and exceptional legibility across dense data displays.
- **Monospace Stack**: `"Geist Mono", "JetBrains Mono", ui-monospace, monospace` for tokens, IDs, code, and telemetry.

### Hierarchy Scale

1. **Display Hero**: `text-4xl sm:text-5xl font-semibold tracking-tight text-foreground` (negative tracking `-0.02em`, leading `1.1`)
2. **Page Title (H1)**: `text-2xl sm:text-3xl font-semibold tracking-tight`
3. **Section Title (H2)**: `text-xl sm:text-2xl font-semibold tracking-tight`
4. **Card / Group Title (H3)**: `text-base sm:text-lg font-semibold`
5. **Body**: `text-sm leading-relaxed text-foreground/90`
6. **Caption / Metadata**: `text-xs font-medium text-muted-foreground`
7. **Monospace / Badge**: `font-mono text-xs uppercase tracking-wider`

---

## 5. Micro-interactions, Springs & Tactile Feedback

Asana interfaces feel alive because every control provides instant, physical feedback:

### 1. Response on Pointer-Down (Kill Latency)

- Trigger highlight or active state immediately on `pointerdown`, not waiting for `click`/`pointerup`.
- Snappy press physics with high-speed damping:
  ```css
  .asana-press {
    transition:
      transform 120ms cubic-bezier(0.16, 1, 0.3, 1),
      opacity 120ms ease;
  }
  .asana-press:active {
    transform: scale(0.985);
  }
  ```

### 2. Asana Celebratory Checkbox

When a task is marked complete, provide a celebratory physical pop:

```css
@keyframes asana-check-pop {
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.18);
  }
  100% {
    transform: scale(1);
  }
}
.asana-check-active {
  animation: asana-check-pop 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 3. Spring Parameters

Use critically damped springs for workspace productivity (no gratuitous wobble, immediate settle):

- **Menus, Popovers & Sheets**: `damping: 1.0`, `response: 0.3` (instant, solid settle)
- **Momentum Drag / Swipes**: `damping: 0.8`, `response: 0.3` (only when previous gesture carried velocity)
- **Direct Manipulation**: Always track 1:1 with pointer offset; hand off release velocity without a "brick wall" stop.

### 4. Translucent Floating Chrome (.asana-glass)

Floating headers, sticky toolbars, and context popovers use restrained translucency with high-density blur:

```css
.asana-glass {
  background: color-mix(in oklch, var(--background) 82%, transparent);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
}
```

### 5. Multi-Layered Neutral Elevations

Avoid single-layer harsh black drop shadows or loud colored glows. Use layered neutral shadows:

- `shadow-xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)` (controls, resting cards)
- `shadow-sm`: `0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)` (hovered cards)
- `shadow-md`: `0 4px 12px -2px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)` (popovers, dropdowns)
- `shadow-lg`: `0 12px 28px -4px rgba(0, 0, 0, 0.10), 0 4px 8px -2px rgba(0, 0, 0, 0.04)` (dialogs, drawers)

### 6. Reduced Motion & Accessibility

Always provide graceful fallbacks:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Design System Enforcement (@shadcn/lint)

All code generated or modified under this design system must pass `@shadcn/lint` rules:

1. **`shadcn/no-raw-colors`**:
   - ❌ Never use raw hex (`#f06a6a`, `#1e1f21`) or default Tailwind colors (`bg-red-500`, `text-blue-600`) in JSX.
   - ✅ Always use semantic tokens: `bg-primary`, `bg-accent`, `text-foreground`, `text-muted-foreground`, `border-border`.
2. **`shadcn/no-arbitrary-values`**:
   - ❌ Never write arbitrary CSS values like `p-[14px]`, `w-[325px]`, `rounded-[18px]`.
   - ✅ Always use standard Tailwind scale classes adhering to the 4px grid: `p-3`, `p-4`, `p-6`, `w-80`, `rounded-md`, `rounded-lg`.
3. **`shadcn/no-restyle`**:
   - ❌ Never bypass core primitive classes to drastically warp component ergonomics.
   - ✅ Honor component contracts (`Button`, `Card`, `Badge`, `TableCell`, `TableHead`, `DateInput`).

---

## 7. Quick Reference Card

| Element             | Specification                  | Tailwind / CSS Utility                                  |
| :------------------ | :----------------------------- | :------------------------------------------------------ |
| **Display Font**    | TWK Lausanne / Swiss geometric | `font-sans tracking-tight font-semibold`                |
| **Monospace Font**  | Geist / JetBrains Mono         | `font-mono text-xs uppercase tracking-wider`            |
| **Baseline Grid**   | 4px cadence                    | `gap-1`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`    |
| **Control Radius**  | 6px (Standard controls)        | `rounded-md`                                            |
| **Card Radius**     | 8px (Panels, task cards)       | `rounded-lg`                                            |
| **Modal Radius**    | 12px (Dialogs, drawers)        | `rounded-xl`                                            |
| **Status Tag**      | Full pill (20px height)        | `h-5 px-2 text-xs font-medium rounded-full`             |
| **Primary Accent**  | Asana Coral `#f06a6a`          | `bg-accent text-accent-foreground` / `border-accent`    |
| **Primary Surface** | Slate Charcoal / Obsidian      | `bg-primary text-primary-foreground`                    |
| **Press Feedback**  | Instant scale settle           | `.asana-press` (`scale(0.985)`, `120ms`)                |
| **Completion**      | Checkmark pop                  | `.asana-check-active` (`scale(1.18)` bounce, `200ms`)   |
| **Floating Glass**  | Translucent header / toolbar   | `.asana-glass` (`blur(12px) saturate(160%)`)            |
| **Lint Rules**      | Strict zero-tolerance          | `@shadcn/lint` (`no-raw-colors`, `no-arbitrary-values`) |
