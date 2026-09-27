import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Developer API Keys table schema.
 * Allows programmatic B2B / API access.
 * Note: Only the SHA-256 hash and a non-sensitive prefix are stored.
 */
export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  prefix: text("prefix").notNull(), // e.g. "app_live_a1b2..."
  lastUsedAt: text("last_used_at"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
