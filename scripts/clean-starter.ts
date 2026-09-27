import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const DEMO_FILES = [
  "apps/user-application/src/routes/showcase.tsx",
  "apps/user-application/src/routes/todos.tsx",
  "apps/user-application/src/components/todos",
];

const isDryRun = process.argv.includes("--dry-run");

console.log("🧹 Modern SaaS Template: Clean-Slate Utility");
console.log(
  isDryRun
    ? "Running in --dry-run mode (no files will be deleted):"
    : "Removing demo showcase files..."
);

let removedCount = 0;

for (const relPath of DEMO_FILES) {
  const target = path.join(rootDir, relPath);
  if (fs.existsSync(target)) {
    if (isDryRun) {
      console.log(`  [would delete] ${relPath}`);
    } else {
      fs.rmSync(target, { recursive: true, force: true });
      console.log(`  [deleted] ${relPath}`);
      removedCount++;
    }
  }
}

if (!isDryRun) {
  console.log(`\n✅ Cleaned ${removedCount} demo file(s)/folder(s).`);
  console.log(
    "Your template is now a clean-slate SaaS chassis ready for custom features."
  );
  console.log(
    "Run `pnpm build:data-ops && pnpm typecheck` to regenerate router manifests."
  );
} else {
  console.log("\nRun `pnpm clean:starter` without --dry-run to apply changes.");
}
