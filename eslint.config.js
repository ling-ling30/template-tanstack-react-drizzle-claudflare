import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import i18next from "eslint-plugin-i18next";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      ".wrangler",
      ".tanstack",
      ".output",
      "**/routeTree.gen.ts",
      "**/worker-configuration.d.ts",
      "**/storybook-static",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      // Downgraded to a warning: a few intentional effect-driven state updates
      // (theme hydration, the navigation progress bar) trip this rule. It is a
      // performance hint, not a correctness bug, so it should not fail the build.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // ---------------------------------------------------------------------------
  // No hardcoded UI strings. Every user-facing string in a route or feature
  // component must go through i18next `t("...")`. This flags literal JSX text
  // and string attributes so they can't sneak in. Run `pnpm lint` to check.
  //
  // Excluded: shadcn `ui/` primitives (generated, contain intentional literals),
  // tests, and non-UI TypeScript. Tune `markupOnly`/`onlyAttribute` as needed.
  // ---------------------------------------------------------------------------
  {
    files: [
      "apps/user-application/src/routes/**/*.tsx",
      "apps/user-application/src/components/**/*.tsx",
    ],
    ignores: [
      "apps/user-application/src/components/ui/**",
      "**/*.test.tsx",
      "**/*.stories.tsx",
    ],
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": [
        "warn",
        {
          markupOnly: true,
          ignoreAttribute: ["className", "id", "to", "href", "type", "name", "key", "variant", "size"],
        },
      ],
    },
  },
  // ---------------------------------------------------------------------------
  // Use theme tokens, not hardcoded colors. Flags Tailwind palette color
  // utilities (bg-zinc-500, text-gray-700, border-slate-200, #hex, etc.) in app
  // code so colors come from the shadcn CSS variables (bg-background,
  // text-muted-foreground, border-border, ...). shadcn ui/* primitives are exempt.
  // ---------------------------------------------------------------------------
  {
    files: [
      "apps/user-application/src/routes/**/*.tsx",
      "apps/user-application/src/components/**/*.tsx",
    ],
    ignores: [
      "apps/user-application/src/components/ui/**",
      "**/*.stories.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "Literal[value=/\\b(?:bg|text|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|caret|accent|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\\b/]",
          message:
            "Use shadcn theme tokens (bg-background, text-muted-foreground, border-border, …) instead of hardcoded palette colors, so dark mode and theming work.",
        },
      ],
    },
  },
);
