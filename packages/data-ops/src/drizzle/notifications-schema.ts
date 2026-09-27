import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * In-app notifications schema.
 * Stores alerts, background job updates, and member activities.
 */
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  organizationId: text("organization_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
