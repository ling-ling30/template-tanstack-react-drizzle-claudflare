import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

/**
 * App (non-auth) tables, ported sqlite-core → mysql-core. The template's
 * `organizations` + `siteSettings` keep their original column shapes (string
 * timestamps) so existing queries in src/queries/* stay unchanged.
 *
 * Gositus additions: org_ai_tenant (org -> AI service client_id mapping) and
 * notification_log (transactional email audit) — see PRD §3.2 / §5.
 */

export const organizations = mysqlTable(
  "organizations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull(),
    name: text("name").notNull(),
    status: mysqlEnum("status", ["active", "disabled"]).notNull(),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: varchar("created_at", { length: 32 }).notNull(),
    updatedAt: varchar("updated_at", { length: 32 }).notNull(),
  },
  (table) => [uniqueIndex("organizations_slug_idx").on(table.slug)]
);

/**
 * Single-row site settings (Open Graph / SEO). One row enforced via id = "default".
 */
export const siteSettings = mysqlTable("site_settings", {
  id: varchar("id", { length: 36 }).primaryKey(), // always "default"
  siteName: text("site_name").notNull(),
  ogTitle: text("og_title").notNull(),
  ogDescription: text("og_description").notNull(),
  ogImage: text("og_image"),
  updatedAt: varchar("updated_at", { length: 32 }).notNull(),
});

/**
 * One row per organization. Maps our org to the AI service's client_id and caches
 * the bits we need to drive notifications + the web widget. The AI service stays
 * system of record for credits/usage; we only mirror what's needed.
 */
export const orgAiTenant = mysqlTable(
  "org_ai_tenant",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 36 }).notNull(),
    // AI service client_acc.id (int there; stored as string for stability).
    aiClientId: varchar("ai_client_id", { length: 64 }),
    status: mysqlEnum("status", ["pending", "provisioned", "disabled"])
      .default("pending")
      .notNull(),
    // Public widget key (safe in page source) + JSON array of allowed origins.
    widgetKey: varchar("widget_key", { length: 64 }),
    allowedOrigins: text("allowed_origins"),
    notifyEmail: varchar("notify_email", { length: 255 }),
    // Low-credit re-arm tracking (70% / 90% thresholds — PRD §4.6).
    lowCredit70NotifiedAt: timestamp("low_credit_70_notified_at"),
    lowCredit90NotifiedAt: timestamp("low_credit_90_notified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("org_ai_tenant_org_uidx").on(table.organizationId),
    uniqueIndex("org_ai_tenant_widget_key_uidx").on(table.widgetKey),
  ]
);

export const notificationLog = mysqlTable(
  "notification_log",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 36 }),
    type: mysqlEnum("type", [
      "low_credit",
      "unanswered_message",
      "subscription_reminder",
      "successful_billing",
      "password_changed",
      "account_created",
    ]).notNull(),
    recipient: varchar("recipient", { length: 255 }).notNull(),
    status: mysqlEnum("status", ["sent", "failed"]).notNull(),
    error: text("error"),
    meta: text("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_log_org_idx").on(table.organizationId),
    index("notification_log_type_idx").on(table.type),
  ]
);
