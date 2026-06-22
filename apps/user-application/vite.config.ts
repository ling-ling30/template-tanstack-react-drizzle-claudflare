import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  // Keep Vite's SSR dep optimizer from pre-bundling TanStack Start internals.
  // Pre-bundling them can drop named exports (e.g. createMiddleware) and surface
  // as "X is not a function" during dev SSR.
  ssr: {
    optimizeDeps: {
      exclude: [
        "@tanstack/react-start",
        "@tanstack/start-client-core",
        "@tanstack/start-server-core",
      ],
    },
  },
  plugins: [
    // Enables `@/*` path aliases from tsconfig.
    // Vite 8 also offers native resolution via `resolve.tsconfigPaths: true`; this
    // plugin is kept for stability. Swap if you prefer one fewer dependency.
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    // Node target (was Cloudflare). TanStack Start defaults to the Node/Nitro
    // server preset when no Cloudflare plugin is present.
    tanstackStart({
      srcDirectory: "src",
      server: { entry: "./server.ts" },
      serverFns: {
        disableCsrfMiddlewareWarning: true,
      },
    }),
    viteReact(),
  ],
});

export default config;
