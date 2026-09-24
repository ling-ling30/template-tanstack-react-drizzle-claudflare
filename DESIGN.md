# DESIGN.md — Design System & Engineering Specification

> Engineered for Asana & Apple-grade precision, clarity, optical harmony, and collaborative velocity.
> Enforced across the entire stack via `@shadcn/lint`, strict OKLCH color spaces, and componentized primitives.

---

## 1. Brand Philosophy & Design Principles

The design system is engineered for **clarity, focus, speed, and collaborative momentum**:

1. **Calm Productivity Canvas**: The interface recedes into the background so user work, photos, tasks, and data take center stage. High-contrast typography on clean, neutral surfaces.
2. **Intentional Accent Energy**: The signature coral accent (`--coral: oklch(0.65 0.22 27.5)`) is reserved for primary focal actions, status highlights, focus rings, and milestone celebrations.
3. **Strict 4px Spatial Cadence**: Every dimension, gap, padding, and height derives from the 4px baseline grid. Arbitrary numbers (e.g. `p-[13px]`) are prohibited.
4. **Concentric Modular Geometry**: A unified 9-tier radius scale obeying the Concentric Nesting Law ($R_{\text{inner}} = R_{\text{outer}} - \text{padding}$), avoiding curvature collisions.
5. **Polymorphic Typography Component**: All text rendering is encapsulated in `<Typography />` with optical tracking calibration, Radix slot delegation, and semantic auto-tag mapping.
6. **Tactile & Snappy Feedback**: Fast micro-interactions (< 160ms) with subtle spring releases (`.asana-press`) and celebratory completion states.

---

## 2. Spatial Grid & Component Metrics (4px Rhythm)

All layout measurements, paddings, gaps, and margins are strictly derived from the **4px / 8px spatial grid**:

| Step                 | Pixels | Rem       | Tailwind Utility | Semantic Application                                     |
| -------------------- | ------ | --------- | ---------------- | -------------------------------------------------------- |
| **xxs (Micro)**      | `4px`  | `0.25rem` | `p-1`, `gap-1`   | Badge insets, icon alignment gaps, tag padding           |
| **xs (Compact)**     | `8px`  | `0.5rem`  | `p-2`, `gap-2`   | Toolbars, dropdown menus, icon buttons, list item gaps   |
| **sm (Control)**     | `12px` | `0.75rem` | `p-3`, `gap-3`   | Compact cards, vertical form stacks, notification toasts |
| **md (Standard)**    | `16px` | `1.0rem`  | `p-4`, `gap-4`   | Container padding, card bodies, table row height rhythm  |
| **lg (Comfortable)** | `24px` | `1.5rem`  | `p-6`, `gap-6`   | Panel padding, modal content, section internal gaps      |
| **xl (Macro)**       | `32px` | `2.0rem`  | `p-8`, `gap-8`   | Section interior separation, hero callouts, empty states |
| **2xl (Section)**    | `48px` | `3.0rem`  | `py-12`, `py-16` | Major page section dividers, landing transitions         |

---

## 3. Concentric Corner Radius System

Corner radii derive from a base `--radius: 0.625rem` (10px) with 9 standardized geometric tiers:

| Token           | Value       | Pixels   | Tailwind Class | Semantic Role & Examples                                            |
| --------------- | ----------- | -------- | -------------- | ------------------------------------------------------------------- |
| `--radius-2xs`  | `0.1875rem` | `3px`    | `rounded-2xs`  | Sub-pixel indicators, checkbox checks, dot badges                   |
| `--radius-xs`   | `0.25rem`   | `4px`    | `rounded-xs`   | Keyboard shortcuts (`<Kbd>`), compact tags, status pips             |
| `--radius-sm`   | `0.375rem`  | `6px`    | `rounded-sm`   | Compact buttons, segmented controls, inner nested controls          |
| `--radius-md`   | `0.5rem`    | `8px`    | `rounded-md`   | Standard buttons, text inputs, dropdown menu items                  |
| `--radius-lg`   | `0.625rem`  | `10px`   | `rounded-lg`   | Base radius, small cards (`size="sm"`), ValueBox, dialog sub-panels |
| `--radius-xl`   | `0.875rem`  | `14px`   | `rounded-xl`   | Standard cards (`Card` default), feature bento panels, sheets       |
| `--radius-2xl`  | `1.125rem`  | `18px`   | `rounded-2xl`  | Modal dialog windows, master viewports, hero shells                 |
| `--radius-3xl`  | `1.5rem`    | `24px`   | `rounded-3xl`  | Floating hero containers, drawer sheets, presentation cards         |
| `--radius-full` | `9999px`    | `9999px` | `rounded-full` | Pill action buttons, avatar circles, filter capsules                |

### Emil Kowalski Concentric Nesting Law

To prevent jarring visual collisions between nested rounded elements, the inner border radius **must** equal the outer radius minus the surrounding padding:

$$R_{\text{inner}} = R_{\text{outer}} - \text{padding}$$

- **Standard Card Shell**: Outer `rounded-xl` ($14\text{px}$) with $8\text{px}$ inset padding $\rightarrow$ Inner element uses $14 - 8 = 6\text{px}$ (`rounded-sm`).
- **Control Group in Panel**: Outer `rounded-lg` ($10\text{px}$) with $4\text{px}$ inset gap $\rightarrow$ Inner control uses $10 - 4 = 6\text{px}$ (`rounded-sm`).

---

## 4. Color System & Dynamic OKLCH Tokens

All colors are defined in the perceptually uniform **OKLCH color space**, providing consistent perceived lightness, vibrant chroma, and guaranteed WCAG contrast.

### Light Mode Spectrum

```css
:root {
  --background: oklch(0.992 0.002 260); /* Pure glare-free canvas */
  --foreground: oklch(
    0.18 0.014 260
  ); /* Deep slate charcoal (14.2:1 contrast) */
  --card: oklch(1 0 0); /* Elevated pure white card surface */
  --card-foreground: oklch(0.18 0.014 260);
  --popover: oklch(1 0 0); /* Floating menus and context sheets */
  --popover-foreground: oklch(0.18 0.014 260);
  --primary: oklch(0.18 0.014 260); /* High-priority actions */
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.965 0.006 250); /* Soft tinted structural fills */
  --secondary-foreground: oklch(0.22 0.014 260);
  --muted: oklch(0.965 0.006 250); /* Subdued backdrops & skeletons */
  --muted-foreground: oklch(
    0.48 0.02 250
  ); /* Metadata & captions (5.2:1 WCAG AAA) */
  --accent: oklch(0.96 0.012 27.5); /* Hover surface tint */
  --accent-foreground: oklch(0.2 0.014 260);
  --destructive: oklch(0.62 0.22 25); /* Destructive actions & error alerts */
  --destructive-foreground: oklch(0.99 0 0);
  --border: oklch(0.92 0.006 250); /* Crisp 1px architectural divider */
  --input: oklch(0.89 0.008 250); /* High-visibility control boundary */
  --ring: oklch(0.65 0.22 27.5); /* Signature coral focus halo */
  --coral: oklch(0.65 0.22 27.5); /* Signature brand coral */
  --coral-foreground: oklch(0.99 0 0);
}
```

### Dark Mode Spectrum (Obsidian Basalt Depth Stack)

Dark mode employs a 3-tier optical depth stack to establish natural hierarchy without stark borders:

```css
.dark {
  --background: oklch(0.13 0.008 260); /* Tier 0: Deep obsidian basalt base */
  --card: oklch(0.18 0.008 260); /* Tier 1: Elevated card container */
  --popover: oklch(0.22 0.008 260); /* Tier 2: Floating popovers & dropdowns */
  --foreground: oklch(
    0.98 0.004 250
  ); /* Crisp white foreground (15.1:1 contrast) */
  --secondary: oklch(0.22 0.008 260);
  --secondary-foreground: oklch(0.98 0.004 250);
  --muted: oklch(0.22 0.008 260);
  --muted-foreground: oklch(
    0.68 0.015 250
  ); /* Legible dark metadata (6.8:1 contrast) */
  --border: oklch(1 0 0 / 11%); /* Soft luminous divider */
  --input: oklch(1 0 0 / 16%); /* Elevated control outline */
  --ring: oklch(0.68 0.21 27.5); /* Luminous coral ring */
  --coral: oklch(0.68 0.21 27.5);
}
```

### Cohesive 5-Step Chart Palette

Calibrated for equal perceptual weight across both light and dark themes:

| Token       | Light OKLCH             | Dark OKLCH              | Semantic Meaning                  |
| ----------- | ----------------------- | ----------------------- | --------------------------------- |
| `--chart-1` | `oklch(0.65 0.22 27.5)` | `oklch(0.68 0.21 27.5)` | **Coral** — Primary lead dataset  |
| `--chart-2` | `oklch(0.64 0.17 150)`  | `oklch(0.67 0.17 150)`  | **Emerald** — Growth & completion |
| `--chart-3` | `oklch(0.68 0.16 230)`  | `oklch(0.72 0.16 230)`  | **Azure** — Baseline & volume     |
| `--chart-4` | `oklch(0.77 0.17 75)`   | `oklch(0.78 0.17 75)`   | **Amber** — Warnings & pending    |
| `--chart-5` | `oklch(0.58 0.23 300)`  | `oklch(0.64 0.23 300)`  | **Amethyst** — Categorical split  |

---

## 5. Typography Component Primitive (`<Typography />`)

All text is rendered via the unified `<Typography />` component in `apps/user-application/src/components/ui/typography.tsx`.

### Features & Capabilities

- **Polymorphic Tag Auto-mapping**: Automatically renders semantic HTML tags (`<h1>`–`<h4>`, `<p>`, `<span>`, `<code>`, `<kbd>`, `<blockquote>`) according to the active variant, or can be overridden via `as="div"`.
- **Radix Slot Delegation (`asChild`)**: Delegates rendering to custom child components while preserving typography classes and semantics.
- **Emil Kowalski Optical Tracking**:
  - Oversized headlines (`display`, `h1`) contract letter-spacing (`-0.035em`, `-0.025em`) to eliminate glyph sprawl.
  - Micro badges and uppercase telemetry expand letter-spacing (`+0.06em`) for effortless scannability.
- **Layout Intelligence**: Built-in support for `balance` (`text-balance`), `pretty` (`text-pretty`), `tabular` (`tabular-nums`), `truncate`, and `clamp={1 | 2 | 3 | 4}`.

### Standard Hierarchy Variants

| Variant      | Default Tag    | Tailwind Typography Classes                                                                                                | Semantic Purpose                            |
| ------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `display`    | `<h1>`         | `text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] leading-[1.08] text-balance`                              | Landing heroes, large numeral anchors       |
| `h1`         | `<h1>`         | `text-3xl sm:text-4xl font-bold tracking-[-0.025em] leading-[1.15] text-balance`                                           | Primary page headers                        |
| `h2`         | `<h2>`         | `text-2xl sm:text-3xl font-semibold tracking-[-0.02em] leading-[1.2] text-balance`                                         | Major section boundaries                    |
| `h3`         | `<h3>`         | `text-xl sm:text-2xl font-semibold tracking-[-0.015em] leading-[1.25] text-balance`                                        | Card titles, group headings                 |
| `h4`         | `<h4>`         | `text-lg sm:text-xl font-semibold tracking-[-0.01em] leading-snug`                                                         | Sub-panel headers, list titles              |
| `lead`       | `<p>`          | `text-base sm:text-lg text-muted-foreground leading-relaxed font-normal`                                                   | Section subtitles, lead paragraphs          |
| `large`      | `<p>`          | `text-base font-medium leading-normal`                                                                                     | Emphasized body text                        |
| `body`       | `<p>`          | `text-sm leading-relaxed font-normal`                                                                                      | Standard application body copy (default)    |
| `small`      | `<small>`      | `text-xs leading-normal font-normal`                                                                                       | Footnotes, compact list details             |
| `caption`    | `<span>`       | `text-xs text-muted-foreground leading-normal font-normal`                                                                 | Helper text, timestamps, field captions     |
| `muted`      | `<span>`       | `text-sm text-muted-foreground leading-normal font-normal`                                                                 | Subdued narrative copy                      |
| `code`       | `<code>`       | `font-mono text-xs bg-muted/80 text-foreground border border-border/60 rounded-md px-1.5 py-0.5`                           | Inline code tokens, CLI commands            |
| `kbd`        | `<kbd>`        | `font-mono text-[11px] font-semibold bg-muted text-muted-foreground border border-border rounded px-1.5 py-0.5 shadow-2xs` | Keyboard shortcut keys                      |
| `micro`      | `<span>`       | `font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground`                                    | Status chips, schema badges, telemetry tags |
| `blockquote` | `<blockquote>` | `border-l-2 border-primary/40 pl-4 italic text-muted-foreground leading-relaxed`                                           | Editorial pull quotes, references           |

### Convenient Typed Subcomponents

```tsx
import { Typography, Heading, Text, Code, Kbd, TypographyComponents } from "@/components/ui/typography";

// Dedicated helper components
<Heading level={1}>Dashboard Title</Heading>
<Text variant="lead">Subtitle description text</Text>
<Code>npm run test</Code>
<Kbd>⌘K</Kbd>

// Namespaced access
<TypographyComponents.Display>Epic Headline</TypographyComponents.Display>
<TypographyComponents.Micro>LIVE · 24MS</TypographyComponents.Micro>
```

---

## 6. Telemetry & Diagnostic Displays (`<ValueBox />`)

Located in `apps/user-application/src/components/ui/value-box.tsx`, the `<ValueBox />` primitive is the standardized component for origin-aware popovers, code readouts, debug metadata, and diagnostic statuses:

### Semantic Variants

- `default`: Neutral slate fill for standard telemetry logs and configuration dumps.
- `info`: Azure tint (`chart-3`) with automatic `Info` icon for contextual explanations.
- `warning`: Amber tint (`chart-4`) with automatic `AlertTriangle` icon for advisory notices.
- `error` / `destructive`: Coral/red tint (`destructive`) with automatic `AlertCircle` icon for validation errors.
- `success`: Emerald tint (`chart-2`) with automatic `CheckCircle2` icon for verified operations.
- `outline`: Bordered transparent container for neutral card-embedded data tables.
- `ghost`: Borderless minimal representation for dense telemetry stacks.

### Compound Structure

```tsx
<ValueBox variant="info">
  <ValueBoxHeader>
    <ValueBoxTitle>Origin-Aware Context</ValueBoxTitle>
    <ValueBoxPill variant="info">E.164</ValueBoxPill>
  </ValueBoxHeader>
  <ValueBoxPayload>
    Scales from the trigger coordinates rather than viewport center.
  </ValueBoxPayload>
</ValueBox>
```

---

## 7. Form Controls & Interactive States

1. **Standard Button (`<Button />`)**:
   - Small: `h-8 px-3 text-xs rounded-md`
   - Default: `h-9.5 px-4 text-sm rounded-md font-medium`
   - Large: `h-11 px-5 text-sm sm:text-base rounded-lg font-medium`
   - Pill: `h-7 px-3 text-xs rounded-full variant="pill"`
   - Interactive: `.asana-press` gives active `scale(0.97)` tactile rebound with `120ms` spring physics.
2. **Phone Input (`<PhoneInput />`)**:
   - Built on `libphonenumber-js` with automated E.164 normalization and country metadata.
   - When invalid: explicitly binds `aria-invalid="true"`, triggering `ring-2 ring-destructive/20 border-destructive text-destructive` indicators.
3. **Cards & Panels (`<Card />`)**:
   - Default: `p-6 rounded-xl border border-border bg-card asana-card-shadow`
   - Small (`size="sm"`): `p-5 rounded-lg border border-border bg-card`
4. **Combobox (`<Combobox />`)**:
   - Keyboard accessible, fuzzy search, popover portal alignment, and selected checkmark.

---

## 8. Motion, Physicality & Easing Standards

Engineered under the design principles of Emil Kowalski ([AUDIT.md]):

### Global Easing Curves (`@theme inline`)

```css
--ease-out: cubic-bezier(
  0.23,
  1,
  0.32,
  1
); /* Responsive deceleration for entering UI */
--ease-in-out: cubic-bezier(
  0.77,
  0,
  0.175,
  1
); /* Fluid repositioning & morphing */
--ease-drawer: cubic-bezier(
  0.32,
  0.72,
  0,
  1
); /* iOS-grade sheet drawer slide */
--ease-spring: cubic-bezier(
  0.16,
  1,
  0.3,
  1
); /* Tactile press & release feedback */
```

### Core Physicality Laws

1. **Trigger Transform Origin**: Popovers, dropdowns, and tooltips must scale from their trigger using `origin-(--radix-popover-content-transform-origin)`. Center scaling is reserved exclusively for modal dialogs.
2. **No `scale(0)`**: Elements appear by combining `scale(0.96)` or `scale(0.75)` with `opacity: 0`. Nothing in reality materializes from a zero-pixel singularity.
3. **Targeted Composited Properties**: Never use `transition-all`. Target explicit properties (`transform`, `opacity`, `background-color`, `border-color`, `box-shadow`) to maintain 60/120fps GPU performance without layout reflows.
4. **Celebratory Completion Feedback**: Checkboxes animate with a 160ms spring zoom (`scale-75` to `scale-100`) and a subtle `scale(0.96)` tactile press dip.
5. **Principled Reduced Motion**: Under `prefers-reduced-motion: reduce`, displacement transforms are suppressed (`transform: none !important`), while calming 150ms opacity and color transitions are preserved to maintain interface feedback.

### Sleek Scrollbar Specifications

To eliminate clunky 17px default OS scrollbars on desktop browsers, the system provides cross-browser scrollbar styling:

- **Tokens**:
  - Light mode: `--scrollbar-thumb: oklch(0.2 0.014 260 / 18%)`, hover `--scrollbar-thumb-hover: oklch(0.2 0.014 260 / 35%)`
  - Dark mode: `--scrollbar-thumb: oklch(0.98 0.004 250 / 20%)`, hover `--scrollbar-thumb-hover: oklch(0.98 0.004 250 / 40%)`
- **Global Track**: 8px width with `2px solid transparent` border and `background-clip: content-box`, yielding a refined 4px floating pill thumb with smooth 150ms hover transition.
- **Firefox & Standards**: `scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) transparent;` applied globally across all elements.
- **Utilities**:
  - `.thin-scrollbar`: 5px compact track for dense sidebars, code panels, and flyouts.
  - `.no-scrollbar`: Suppresses visible scrollbars while preserving touch, mouse wheel, and trackpad swipe physics.
  - `<ScrollArea>` & `<ScrollBar>`: Radix UI virtualized scrollbar primitive styled with matching design tokens and smooth transitions.

---

## 9. Design System Enforcement (@shadcn/lint)

The design system is strictly guarded by `@shadcn/lint`:

- **`shadcn/no-raw-colors`**: Prohibits hardcoded hex codes or arbitrary palette colors (e.g. `bg-emerald-500`, `text-blue-600`). Colors must come from semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`, etc.).
- **`shadcn/no-arbitrary-values`**: Disallows arbitrary values like `p-[14px]` or `w-[327px]`. Must adhere to the 4px grid and standard radius scale.
- **`shadcn/no-restyle`**: Preserves component encapsulation (`Button`, `Card`, `Typography`, `ValueBox`) and ensures visual consistency across the entire application.
