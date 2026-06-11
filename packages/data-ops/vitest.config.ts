import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Test the TypeScript sources, not the compiled dist output (avoids
    // double-running every test once the package has been built).
    include: ["src/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"],
    passWithNoTests: true,
  },
});
