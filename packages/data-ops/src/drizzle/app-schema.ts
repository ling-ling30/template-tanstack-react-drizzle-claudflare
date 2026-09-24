import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// Organizations live in Better Auth's `organization` table (auth-schema.ts) — the
// single source of truth for tenants, membership and roles. Do not add an app copy.

/**
 * Single-row site settings (Open Graph / SEO metadata for the public site).
 * We enforce one row by always using id = "default".
 */
export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey(), // always "default"
  siteName: text("site_name").notNull(),
  ogTitle: text("og_title").notNull(),
  ogDescription: text("og_description").notNull(),
  ogImage: text("og_image"),
  updatedAt: text("updated_at").notNull(),
});
