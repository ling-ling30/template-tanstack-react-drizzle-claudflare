import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    // Native tsconfig `paths` resolution (enables the `@/*` alias).
    tsconfigPaths: true,
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
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      server: { entry: "./server.ts" },
      serverFns: {
        disableCsrfMiddlewareWarning: true,
      },
    }),
    viteReact(),
    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
    }),
  ],
});

export default config;
