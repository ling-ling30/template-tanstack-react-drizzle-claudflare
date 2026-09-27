import { eq } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import {
  paymentConfig,
  type PaymentEnvironment,
  type PaymentProviderName,
} from "../drizzle/payment-config-schema";

const CONFIG_ID = "default";

export type PaymentConfigRow = typeof paymentConfig.$inferSelect;

/** The credential columns; secret ones hold ciphertext written by the app. */
export type PaymentCredentialField = Exclude<
  keyof PaymentConfigRow,
  "id" | "provider" | "environment" | "updatedAt" | "updatedBy"
>;

export async function getPaymentConfig(
  db: AppDatabase
): Promise<PaymentConfigRow | null> {
  const rows = await db
    .select()
    .from(paymentConfig)
    .where(eq(paymentConfig.id, CONFIG_ID))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Creates or updates the single config row. Credential fields: `undefined`
 * keeps the stored value, `null` clears it, a string replaces it.
 */
export async function savePaymentConfig(
  db: AppDatabase,
  input: {
    provider: PaymentProviderName;
    environment: PaymentEnvironment;
    credentials: Partial<Record<PaymentCredentialField, string | null>>;
    updatedBy: string;
    now: number;
  }
): Promise<void> {
  const credentials = Object.fromEntries(
    Object.entries(input.credentials).filter(([, v]) => v !== undefined)
  ) as Partial<Record<PaymentCredentialField, string | null>>;
  const set = {
    provider: input.provider,
    environment: input.environment,
    ...credentials,
    updatedAt: input.now,
    updatedBy: input.updatedBy,
  };
  await db
    .insert(paymentConfig)
    .values({ id: CONFIG_ID, ...set })
    .onConflictDoUpdate({ target: paymentConfig.id, set });
}
