import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: ["dist/**", "node_modules/**", ".wrangler/**", ".tanstack/**"],
    passWithNoTests: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
