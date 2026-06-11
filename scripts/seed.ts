/**
 * Demo data seed.
 *
 * Gives a fresh clone something to look at on first `pnpm dev`:
 *   1. Creates a platform-admin user via the running dev server's auth API.
 *   2. Inserts a demo organization + default site settings into local D1.
 *
 * Prerequisites: the dev server must be running (`pnpm dev:user-application`).
 * Idempotent: re-running is safe (uses INSERT OR IGNORE for demo rows; the
 * auth sign-up simply reports if the user already exists).
 *
 * Run: `pnpm seed`
 *
 * Override via env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, DEMO_ORG_SLUG.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { env } from "node:process";

const BASE_URL = env.SEED_BASE_URL || "http://localhost:3000";
const adminEmail = env.ADMIN_EMAIL || "owner@example.com";
const adminPassword = env.ADMIN_PASSWORD || "admin123456";
const adminName = env.ADMIN_NAME || "Platform Admin";
const orgSlug = env.DEMO_ORG_SLUG || "demo";
const DB_NAME = "saas_template_db";

async function createAdmin() {
  console.log(`Creating MASTER platform admin: ${adminEmail} ...`);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE_URL },
      body: JSON.stringify({ email: adminEmail, password: adminPassword, name: adminName }),
    });
    if (res.ok) {
      console.log("  ✓ Admin created.");
    } else {
      const text = await res.text();
      if (text.includes("already") || res.status === 422) {
        console.log("  • Admin already exists, skipping.");
      } else {
        console.error("  ✗ Failed to create admin:", text);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error("  ✗ Could not reach the dev server.", err);
    console.error(`  → Start it first: pnpm dev:user-application (expected at ${BASE_URL})`);
    process.exit(1);
  }
}

function d1(sql: string) {
  // wrangler reads SQL from a temp file (avoids cross-platform shell-quoting issues
  // with multi-line SQL). On Windows, pnpm resolves to pnpm.cmd, so use shell: true.
  const file = join(tmpdir(), `seed-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  writeFileSync(file, sql, "utf8");
  try {
    execFileSync(
      "pnpm",
      ["--filter", "user-application", "exec", "wrangler", "d1", "execute", DB_NAME, "--local", "--file", file],
      { stdio: "inherit", shell: true },
    );
  } finally {
    rmSync(file, { force: true });
  }
}

function seedDemoRows() {
  console.log(`Seeding demo organization "${orgSlug}" + default site settings ...`);
  const now = new Date().toISOString();
  const orgId = `org_demo`;
  d1(
    `INSERT OR IGNORE INTO organizations (id, slug, name, status, created_by, created_at, updated_at)
     VALUES ('${orgId}', '${orgSlug}', 'Demo Organization', 'active', '${adminEmail}', '${now}', '${now}');`,
  );
  d1(
    `INSERT OR IGNORE INTO site_settings (id, site_name, og_title, og_description, og_image, updated_at)
     VALUES ('default', 'Modern SaaS Template', 'Modern SaaS Template', 'A production-ready SaaS template.', NULL, '${now}');`,
  );
  console.log("  \u2713 Demo rows + default site settings inserted.");
}

async function main() {
  await createAdmin();
  seedDemoRows();
  console.log(`\n✅ Seed complete. Sign in at ${BASE_URL}/platform/login`);
}

main();
