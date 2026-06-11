---
name: add-ui-component
description: >-
  How to add a UI component to this template (shadcn/ui primitive or a custom
  component) and preview it in Storybook. Use when the user asks to add a button,
  dialog, dropdown, table, or any UI component, or to create a shadcn component.
---

# Add a UI component

This app uses shadcn/ui ("new-york" style, `neutral` base color) under
`apps/user-application/src/components/ui/`. Tailwind v4 with CSS variables in `styles.css`.

## Add a shadcn primitive
```bash
cd apps/user-application
pnpm dlx shadcn@latest add <component>      # e.g. tooltip, dialog, accordion
```
It lands in `src/components/ui/<component>.tsx`. Import via the alias:
`import { Button } from "@/components/ui/button";`

## Add a custom component
Put feature components outside `ui/` (e.g. `src/components/<feature>/<thing>.tsx`).
Reserve `ui/` for shadcn primitives. Use `cn()` from `@/lib/utils` for class merging.

## Rules
- **No hardcoded UI strings.** Any visible text uses `useTranslation()` + `t("...")`, with
  the key added to every locale in `src/i18n/locales/*/common.json`. NOTE: `components/ui/*`
  is exempt from the i18n lint rule (primitives are generic), but YOUR feature components
  are not — translate their text.
- Keep components presentational; fetch data in hooks/routes, pass via props.

## Preview in Storybook
Add `src/stories/<component>.stories.tsx` (see `button.stories.tsx`, `field.stories.tsx`):
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Thing } from "@/components/ui/thing";
const meta = { title: "UI/Thing", component: Thing, tags: ["autodocs"] } satisfies Meta<typeof Thing>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
```
```bash
pnpm --filter user-application storybook      # :6006
```

## Verify
```bash
pnpm typecheck && pnpm lint
```
