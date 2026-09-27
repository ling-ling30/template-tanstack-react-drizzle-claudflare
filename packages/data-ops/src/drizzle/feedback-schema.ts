import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const FEEDBACK_CATEGORIES = ["bug", "feature", "general"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;
export type FeedbackSeverity = (typeof FEEDBACK_SEVERITIES)[number];

export const FEEDBACK_STATUSES = ["open", "in_progress", "resolved"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

/**
 * In-app bug reports and feedback submissions schema.
 * Captures user telemetry, issue severity, page URL, and triage status.
 */
export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  organizationId: text("organization_id"),
  category: text("category").notNull().default("bug"),
  severity: text("severity").notNull().default("medium"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  pageUrl: text("page_url").notNull(),
  metadata: text("metadata"), // JSON string with userAgent, screen, etc.
  status: text("status").notNull().default("open"),
  createdAt: text("created_at").notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
