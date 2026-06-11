import { uniqueIndex, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const organizations = sqliteTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    status: text("status", { enum: ["active", "disabled"] }).notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("organizations_slug_idx").on(table.slug)],
);

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
