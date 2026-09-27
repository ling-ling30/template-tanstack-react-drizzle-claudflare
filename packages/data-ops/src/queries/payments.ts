import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import {
  payments,
  type NewPaymentRow,
  type PaymentRow,
  type PaymentStatus,
} from "../drizzle/payments-schema";

export async function createPaymentRecord(
  db: AppDatabase,
  input: {
    orderId: string;
    amountIdr: number;
    provider: string;
    providerEnv?: string;
    providerOrderId?: string;
    organizationId?: string | null;
    userId?: string | null;
    metadata?: string | null;
    now?: number;
  }
): Promise<PaymentRow> {
  const now = input.now ?? Date.now();
  const id = `pay_${now}_${Math.random().toString(36).slice(2, 7)}`;
  const row: NewPaymentRow = {
    id,
    orderId: input.orderId,
    organizationId: input.organizationId ?? null,
    userId: input.userId ?? null,
    amountIdr: input.amountIdr,
    currency: "IDR",
    status: "pending",
    provider: input.provider,
    providerEnv: input.providerEnv ?? "sandbox",
    providerOrderId: input.providerOrderId ?? input.orderId,
    method: null,
    metadata: input.metadata ?? null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(payments).values(row);
  return row as PaymentRow;
}

export async function getPaymentByOrderId(
  db: AppDatabase,
  orderId: string
): Promise<PaymentRow | null> {
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);
  return rows[0] ?? null;
}

export async function updatePaymentStatus(
  db: AppDatabase,
  input: {
    orderId: string;
    status: PaymentStatus;
    method?: string | null;
    paidAt?: number | null;
    now?: number;
  }
): Promise<void> {
  const now = input.now ?? Date.now();
  const set: Partial<NewPaymentRow> = {
    status: input.status,
    updatedAt: now,
  };
  if (input.method !== undefined) set.method = input.method;
  if (input.paidAt !== undefined) set.paidAt = input.paidAt;

  await db.update(payments).set(set).where(eq(payments.orderId, input.orderId));
}

export async function listPaymentsByOrg(
  db: AppDatabase,
  organizationId: string,
  limit = 20
): Promise<PaymentRow[]> {
  return db
    .select()
    .from(payments)
    .where(eq(payments.organizationId, organizationId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function listPendingPaymentsToSync(
  db: AppDatabase,
  options: {
    since: number;
    before: number;
    limit?: number;
  }
): Promise<PaymentRow[]> {
  return db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.status, "pending"),
        gte(payments.createdAt, options.since),
        lte(payments.createdAt, options.before)
      )
    )
    .limit(options.limit ?? 50);
}
