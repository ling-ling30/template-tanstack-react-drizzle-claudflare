/**
 * Pre-flight environment check.
 *
 * Validates that the env vars the app needs are present before `pnpm dev`,
 * printing friendly errors instead of a cryptic runtime crash.
 *
 * Run: `pnpm check:env`
 *
 * Checks `apps/user-application/.env` exists and defines the required vars.
 * (Migrated off Cloudflare: no wrangler bindings to check.)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = join(root, "apps", "user-application");

const REQUIRED = [
  "BETTER_AUTH_URL",
  "BETTER_AUTH_SECRET",
  "PLATFORM_ADMIN_EMAILS",
  "DATABASE_URL",
  "AI_SERVICE_URL",
] as const;

const errors: string[] = [];
const warnings: string[] = [];

const envPath = join(appDir, ".env");
if (!existsSync(envPath)) {
  errors.push(
    `Missing ${envPath}\n   → Copy apps/user-application/.env.example to .env and fill it in.`
  );
} else {
  const content = readFileSync(envPath, "utf8");
  const defined = new Map<string, string>();
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) defined.set(m[1]!, m[2]!);
  }
  for (const key of REQUIRED) {
    const val = defined.get(key);
    if (val === undefined) {
      errors.push(`${key} is not set in .env`);
    } else if (val === "" || val.startsWith("replace-this")) {
      warnings.push(`${key} still has a placeholder value`);
    }
  }
  // AI service trust: at least one mechanism must be configured.
  const jwt = defined.get("AI_SERVICE_JWT_SECRET");
  const key = defined.get("AI_SERVICE_KEY");
  if (!jwt && !key) {
    warnings.push(
      "Neither AI_SERVICE_JWT_SECRET nor AI_SERVICE_KEY is set — AI service calls will fail"
    );
  }
}

for (const w of warnings) console.warn(`⚠️  ${w}`);
if (errors.length > 0) {
  console.error("\n❌ Environment check failed:\n");
  for (const e of errors) console.error(`   • ${e}`);
  console.error("");
  process.exit(1);
}
console.log("✅ Environment check passed.");
