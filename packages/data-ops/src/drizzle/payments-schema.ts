import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "expired",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const payments = sqliteTable(
  "payments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().unique(),
    organizationId: text("organization_id"),
    userId: text("user_id"),
    amountIdr: integer("amount_idr").notNull(),
    currency: text("currency").default("IDR").notNull(),
    status: text("status", { enum: PAYMENT_STATUSES }).notNull(),
    provider: text("provider").notNull(), // "doku" | "midtrans" | "fake"
    providerEnv: text("provider_env"), // "sandbox" | "production" | "local"
    providerOrderId: text("provider_order_id"),
    method: text("method"), // e.g. "bca_va", "qris", "echannel", etc.
    metadata: text("metadata"), // JSON string for arbitrary application payload
    paidAt: integer("paid_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("payments_org_idx").on(table.organizationId),
    index("payments_user_idx").on(table.userId),
    index("payments_order_idx").on(table.orderId),
  ]
);

export type PaymentRow = typeof payments.$inferSelect;
export type NewPaymentRow = typeof payments.$inferInsert;
