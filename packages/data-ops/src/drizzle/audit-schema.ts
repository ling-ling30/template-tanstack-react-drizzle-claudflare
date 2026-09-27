import { sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Standard B2B / SaaS Audit Log schema.
 * Tracks critical actions (who did what, to which resource, when, from where).
 */
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id"),
  actorId: text("actor_id").notNull(),
  actorEmail: text("actor_email"),
  action: text("action").notNull(), // e.g. "org.update", "member.invite", "member.remove"
  resourceType: text("resource_type").notNull(), // e.g. "organization", "member"
  resourceId: text("resource_id"),
  metadata: text("metadata"), // JSON-encoded string
  ipAddress: text("ip_address"),
  createdAt: text("created_at").notNull(), // ISO-8601 string
});

export type AuditLogEntry = typeof auditLogs.$inferSelect;
export type NewAuditLogEntry = typeof auditLogs.$inferInsert;
