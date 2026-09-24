import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

import type { Plugin } from "vite";

function startStorageContextClientPlugin(): Plugin {
  return {
    name: "start-storage-context-client-stub",
    enforce: "pre",
    resolveId(id, _importer, options) {
      if (
        !options?.ssr &&
        (id === "node:async_hooks" || id === "async_hooks")
      ) {
        return "\0virtual:browser-async-hooks";
      }
      if (!options?.ssr && id === "@tanstack/start-storage-context") {
        return "\0virtual:start-storage-context-client";
      }
      return null;
    },
    load(id, options) {
      if (
        (!options?.ssr &&
          id.includes("start-storage-context") &&
          id.includes("async-local-storage")) ||
        id === "\0virtual:start-storage-context-client"
      ) {
        return `
          export function getStartContext() {
            throw new Error("getStartContext is only available on the server.");
          }
          export async function runWithStartContext(ctx, fn) {
            return fn();
          }
        `;
      }
      if (id === "\0virtual:browser-async-hooks") {
        return `
          export class AsyncLocalStorage {
            getStore() { return undefined; }
            run(_store, callback) { return callback(); }
          }
          export default {
            AsyncLocalStorage: class {
              getStore() { return undefined; }
              run(_store, callback) { return callback(); }
            }
          };
        `;
      }
      return null;
    },
  };
}

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
    startStorageContextClientPlugin(),
    // Enables `@/*` path aliases from tsconfig.
    // Vite 8 also offers native resolution via `resolve.tsconfigPaths: true`; this
    // plugin is kept for stability. Swap if you prefer one fewer dependency.
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
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
