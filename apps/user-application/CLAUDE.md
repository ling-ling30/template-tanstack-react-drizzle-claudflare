# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm serve` - Preview production build
- `pnpm test` - Run tests with Vitest

### Shadcn Components
- `pnpx shadcn@latest add <component>` - Add new Shadcn components (use latest version)

## Architecture

This is a TanStack Start application - a type-safe, client-first, full-stack React framework built on top of:

### Core Stack
- **TanStack Router**: File-based routing with type-safe navigation
- **TanStack Query**: Server state management with SSR integration
- **React 19**: Latest React with concurrent features
- **Vite**: Build tool and dev server
- **TypeScript**: Strict type checking enabled
- **Tailwind CSS v4**: Utility-first styling with CSS variables

### Project Structure
- `src/routes/` - File-based routes (auto-generates `routeTree.gen.ts`)
- `src/components/` - Reusable React components  
- `src/integrations/tanstack-query/` - Query client setup and providers
- `src/lib/utils.ts` - Utility functions (includes clsx/tailwind-merge)
- `src/utils/seo.ts` - SEO helper functions
- Path aliases: `@/*` maps to `src/*`

### Key Architecture Patterns

**Router Setup**: The router is created via `getRouter()` in `src/router.tsx` which integrates TanStack Query context and SSR. Routes are auto-generated from the file system.

**Query Integration**: TanStack Query is pre-configured with SSR support through `setupRouterSsrQueryIntegration`. The query client is accessible in route contexts.

**Root Layout**: `src/routes/__root.tsx` defines the HTML document structure, includes devtools, and provides navigation links. It uses `createRootRouteWithContext` for type-safe context passing.

**Styling**: Uses Tailwind CSS v4 with the Vite plugin. Shadcn components are configured with "new-york" style, Zinc base color, and CSS variables enabled.

**TypeScript**: Strict mode with additional linting rules (`noUnusedLocals`, `noUnusedParameters`, etc.). Uses modern ESNext module resolution.

### Server Runtime & Data Access
The worker boots through `src/core/runtime.ts`: `initRuntime(env)` validates env, builds the
DB + auth via the `createDatabase`/`createAuth` factories in `@repo/data-ops`, and memoizes them.
Read them on the server with `getRuntime()`. `getDb()`/`getAuth()` singletons remain available.

### Testing
Vitest + jsdom + Testing Library. Config in `vitest.config.ts`, global setup in `src/test/setup.ts`.
Run `pnpm test`.

### Internationalization — NO hardcoded strings
All user-facing copy goes through react-i18next: `const { t } = useTranslation();` then
`t("namespace.key")`. Never put literal strings in JSX. Locales live in `src/i18n/locales/<lng>/common.json`.
The `i18next/no-literal-string` ESLint rule enforces this (run `pnpm lint`); `components/ui/*` is exempt.
Add languages in `src/i18n/config.ts` (`SUPPORTED_LANGUAGES` + `resources`).

### Theming
shadcn `neutral` base color; CSS variables in `src/styles.css`. Theme switching via `next-themes`.

### Development Notes
- Demo files (prefixed with `demo`) can be safely deleted
- The project uses pnpm as the package manager
- Devtools are included for both Router and Query in development
- Routes support loaders, error boundaries, and not-found components
- File-based routing automatically generates type-safe route definitions