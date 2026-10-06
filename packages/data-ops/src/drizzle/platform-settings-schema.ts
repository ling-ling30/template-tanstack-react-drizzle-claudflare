import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Platform-wide operator settings, one row ("default"), edited in the platform
 * dashboard. No row means every setting is at its default (see
 * `DEFAULT_PLATFORM_SETTINGS`).
 */
export const platformSettings = sqliteTable("platform_settings", {
  id: text("id").primaryKey(), // always "default"
  /**
   * Whether a user may create more than one organization of their own.
   * Off = one self-serve organization per user.
   */
  allowMultipleOrganizations: integer("allow_multiple_organizations", {
    mode: "boolean",
  })
    .notNull()
    .default(true),
  updatedAt: integer("updated_at").notNull(),
  updatedBy: text("updated_by"),
});
