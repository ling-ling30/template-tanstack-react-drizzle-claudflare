# DESIGN.md — Asana Design System & Engineering Specification

> Inspired by Asana DesignMD (designmd.co/d/asana) and modern productivity work-management engineering.

---

## 1. Brand Philosophy & Design Principles

The Asana design system is engineered for **clarity, focus, speed, and collaborative momentum**:

1. **Calm Productivity Canvas**: The interface recedes into the background so user work, photos, tasks, and data take center stage. High-contrast typography on clean, neutral surfaces.
2. **Intentional Accent Energy**: Asana's iconic coral accent (`#f06a6a` / `oklch(0.67 0.19 22.5)`) is reserved for primary focal actions, status highlights, focus rings, and milestone celebrations.
3. **Strict 4px Spatial Cadence**: Every dimension, gap, padding, and height derives from the 4px baseline grid.
4. **Crisp, Modular Geometry**: Controlled, ergonomic corner radii (4px, 6px, 8px, 12px) rather than oversized bubbles, maximizing information density and visual structure.
5. **Tactile & Snappy Feedback**: Fast micro-interactions (< 160ms) with subtle spring releases and celebratory completion states.

---

## 2. Spatial Grid & Component Metrics (4px Rhythm)

All layout measurements, paddings, gaps, and margins are strictly derived from the **4px / 8px spatial grid**. Arbitrary values (e.g. `p-[13px]`, `gap-[7px]`) are prohibited and enforced via `@shadcn/lint`.

| Step                 | Pixels | Rem       | Tailwind Utility | Semantic Application                                     |
| -------------------- | ------ | --------- | ---------------- | -------------------------------------------------------- |
| **xxs (Micro)**      | `4px`  | `0.25rem` | `p-1`, `gap-1`   | Badge insets, icon alignment gaps, tag padding           |
| **xs (Compact)**     | `8px`  | `0.5rem`  | `p-2`, `gap-2`   | Toolbars, dropdown menus, icon buttons, list item gaps   |
| **sm (Control)**     | `12px` | `0.75rem` | `p-3`, `gap-3`   | Compact cards, vertical form stacks, notification toasts |
| **md (Standard)**    | `16px` | `1.0rem`  | `p-4`, `gap-4`   | Container padding, card bodies, table row height rhythm  |
| **lg (Comfortable)** | `24px` | `1.5rem`  | `p-6`, `gap-6`   | Panel padding, modal content, section internal gaps      |
| **xl (Macro)**       | `32px` | `2.0rem`  | `p-8`, `gap-8`   | Section interior separation, hero callouts, empty states |
| **2xl (Section)**    | `48px` | `3.0rem`  | `py-12`, `py-16` | Major page section dividers, landing transitions         |

### Standardized Component Padding & Geometry

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

The color system adapts to Light and Dark themes via OKLCH CSS variables:

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

### Hierarchy Scale

1. **Display Hero**: `text-4xl sm:text-5xl font-semibold tracking-tight text-foreground`
2. **Page Title (H1)**: `text-2xl sm:text-3xl font-semibold tracking-tight`
3. **Section Title (H2)**: `text-xl sm:text-2xl font-semibold tracking-tight`
4. **Card / Group Title (H3)**: `text-base sm:text-lg font-semibold`
5. **Body**: `text-sm leading-relaxed text-foreground/90`
6. **Caption / Metadata**: `text-xs font-medium text-muted-foreground`
7. **Monospace (Code / ID / Tokens)**: `"Geist Mono", "JetBrains Mono", ui-monospace, monospace`

---

## 5. Asana Micro-interactions & Motion

1. **Snappy Press Feedback**:
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
2. **Asana Celebratory Checkbox**:
   - Checkbox transitions with a celebratory check bounce (`scale(1.15) -> scale(1.0)` over 200ms) with coral/green completion fill.
3. **Restrained Shadows (Multi-layered Neutral Depth)**:
   - `shadow-xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)`
   - `shadow-sm`: `0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)`
   - `shadow-md`: `0 4px 12px -2px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)`
   - `shadow-lg`: `0 12px 28px -4px rgba(0, 0, 0, 0.10), 0 4px 8px -2px rgba(0, 0, 0, 0.04)`
4. **Reduced Motion**:
   - `prefers-reduced-motion: reduce` suppresses transforms and uses instant opacity cross-fades.

---

## 6. Design System Enforcement (@shadcn/lint)

The design system is strictly guarded by `@shadcn/lint`:

- **`shadcn/no-raw-colors`**: Prohibits hardcoded hex codes or arbitrary palette colors (e.g. `bg-emerald-500`, `text-blue-600`). Colors must come from semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`, etc.).
- **`shadcn/no-arbitrary-values`**: Disallows arbitrary values like `p-[14px]` or `w-[327px]`. Must adhere to the 4px grid.
- **`shadcn/no-restyle`**: Preserves component encapsulation (`Button`, `Card`, `Badge`) and ensures visual consistency across the app.
