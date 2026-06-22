/**
 * Demo data seed.
 *
 * Gives a fresh clone something to look at on first `pnpm dev`:
 *   1. Creates a platform-admin user via the running dev server's auth API.
 *   2. Inserts a demo organization + default site settings into MySQL (via Drizzle).
 *
 * Prerequisites:
 *   - DATABASE_URL set (same MySQL the app uses).
 *   - The dev server running for step 1 (`pnpm dev:user-application`).
 * Idempotent: re-running is safe (INSERT IGNORE for demo rows; auth sign-up just
 * reports if the user already exists).
 *
 * Run: `pnpm seed`
 *
 * Override via env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, DEMO_ORG_SLUG, DATABASE_URL.
 */
import { env } from "node:process";
import { createDatabase } from "@repo/data-ops/database/setup";
import { organizations, siteSettings } from "@repo/data-ops/drizzle/app-schema";

const BASE_URL = env.SEED_BASE_URL || "http://localhost:3000";
const adminEmail = env.ADMIN_EMAIL || "owner@example.com";
const adminPassword = env.ADMIN_PASSWORD || "admin123456";
const adminName = env.ADMIN_NAME || "Platform Admin";
const orgSlug = env.DEMO_ORG_SLUG || "demo";
const databaseUrl = env.DATABASE_URL;

async function createAdmin() {
  console.log(`Creating MASTER platform admin: ${adminEmail} ...`);
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE_URL },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      }),
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
    console.error(
      `  → Start it first: pnpm dev:user-application (expected at ${BASE_URL})`
    );
    process.exit(1);
  }
}

async function seedDemoRows() {
  if (!databaseUrl) {
    console.error("  ✗ DATABASE_URL is not set — cannot seed demo rows.");
    process.exit(1);
  }
  console.log(
    `Seeding demo organization "${orgSlug}" + default site settings ...`
  );
  const db = createDatabase(databaseUrl);
  const now = new Date().toISOString();

  // INSERT IGNORE: skip if the unique slug / default id already exists.
  await db.insert(organizations).ignore().values({
    id: "org_demo",
    slug: orgSlug,
    name: "Demo Organization",
    status: "active",
    createdBy: adminEmail,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(siteSettings).ignore().values({
    id: "default",
    siteName: "Modern SaaS Template",
    ogTitle: "Modern SaaS Template",
    ogDescription: "A production-ready SaaS template.",
    ogImage: null,
    updatedAt: now,
  });

  console.log("  ✓ Demo rows + default site settings inserted.");
}

async function main() {
  await createAdmin();
  await seedDemoRows();
  console.log(`\n✅ Seed complete. Sign in at ${BASE_URL}/dashboard`);
  process.exit(0);
}

main();
