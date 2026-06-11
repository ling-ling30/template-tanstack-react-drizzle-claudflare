/**
 * Pre-flight environment check.
 *
 * Validates that the secrets required by the app are present before you run
 * `pnpm dev` or deploy, and prints friendly, actionable errors instead of a
 * cryptic runtime crash deep in a request.
 *
 * Run: `pnpm check:env`
 *
 * Checks:
 *  - `apps/user-application/.dev.vars` exists and defines the required secrets
 *  - `wrangler.jsonc` declares the D1 + R2 bindings the worker needs
 *
 * This does NOT validate the live Cloudflare bindings (those only exist at
 * runtime); it checks that your local config is wired correctly.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = join(root, "apps", "user-application");

const REQUIRED_SECRETS = [
  "BETTER_AUTH_URL",
  "BETTER_AUTH_SECRET",
  "PLATFORM_ADMIN_EMAILS",
] as const;

const REQUIRED_BINDINGS = ["DB", "PROOF_BUCKET"] as const;

const errors: string[] = [];
const warnings: string[] = [];

// --- 1. .dev.vars secrets -----------------------------------------------------
const devVarsPath = join(appDir, ".dev.vars");
if (!existsSync(devVarsPath)) {
  errors.push(
    `Missing ${devVarsPath}\n   → Copy apps/user-application/.dev.vars.example to .dev.vars and fill it in.`,
  );
} else {
  const content = readFileSync(devVarsPath, "utf8");
  const defined = new Map<string, string>();
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) defined.set(m[1], m[2]);
  }
  for (const key of REQUIRED_SECRETS) {
    const val = defined.get(key);
    if (val === undefined) {
      errors.push(`${key} is not set in .dev.vars`);
    } else if (val === "" || val.startsWith("replace-this")) {
      warnings.push(`${key} still has a placeholder value`);
    }
  }
}

// --- 2. wrangler bindings -----------------------------------------------------
const wranglerPath = join(appDir, "wrangler.jsonc");
if (!existsSync(wranglerPath)) {
  errors.push(`Missing ${wranglerPath}`);
} else {
  const wrangler = readFileSync(wranglerPath, "utf8");
  for (const binding of REQUIRED_BINDINGS) {
    if (!wrangler.includes(`"${binding}"`)) {
      errors.push(`Binding "${binding}" not found in wrangler.jsonc`);
    }
  }
}

// --- report -------------------------------------------------------------------
for (const w of warnings) console.warn(`⚠️  ${w}`);
if (errors.length > 0) {
  console.error("\n❌ Environment check failed:\n");
  for (const e of errors) console.error(`   • ${e}`);
  console.error("");
  process.exit(1);
}
console.log("✅ Environment check passed.");
