import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const PAYMENT_PROVIDERS = ["doku", "midtrans"] as const;
export type PaymentProviderName = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_ENVIRONMENTS = ["sandbox", "production"] as const;
export type PaymentEnvironment = (typeof PAYMENT_ENVIRONMENTS)[number];

/**
 * Payment gateway settings, one row ("default"), edited in the platform
 * operator dashboard. Secret keys are stored encrypted by the app (AES-GCM with
 * the PAYMENT_CONFIG_KEY secret); the database never stores them in plaintext.
 * Sandbox and production keys live side by side so switching is one click.
 */
export const paymentConfig = sqliteTable("payment_config", {
  id: text("id").primaryKey(),
  provider: text("provider", { enum: PAYMENT_PROVIDERS }).notNull(),
  environment: text("environment", { enum: PAYMENT_ENVIRONMENTS }).notNull(),
  dokuSandboxClientId: text("doku_sandbox_client_id"),
  dokuSandboxSecretKey: text("doku_sandbox_secret_key"),
  dokuProductionClientId: text("doku_production_client_id"),
  dokuProductionSecretKey: text("doku_production_secret_key"),
  midtransSandboxServerKey: text("midtrans_sandbox_server_key"),
  midtransProductionServerKey: text("midtrans_production_server_key"),
  updatedAt: integer("updated_at").notNull(),
  updatedBy: text("updated_by"),
});
