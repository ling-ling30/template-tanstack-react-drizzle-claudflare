import type { AppDatabase } from "@repo/data-ops/database/setup";
import { appError } from "@repo/data-ops/errors";
import {
  getPaymentConfig,
  type PaymentConfigRow,
} from "@repo/data-ops/queries/payment-config";
import type { ValidatedEnv } from "@/core/env";
import { logger } from "@/core/logger/logger";
import { DokuProvider } from "./doku";
import { FakePaymentProvider } from "./fake";
import { MidtransProvider } from "./midtrans";
import type { PaymentProvider } from "./provider";
import { openSecret } from "./secret-box";

export type GatewayName = "doku" | "midtrans";
export type GatewayEnvironment = "sandbox" | "production";
export const GATEWAY_ENVIRONMENTS: GatewayEnvironment[] = [
  "sandbox",
  "production",
];

type DokuKeys = { clientId: string; secretKey: string };
type MidtransKeys = { serverKey: string };

/** Everything needed to build providers, merged from the DB row and env. */
export type PaymentSettings = {
  /** "database" once an operator saved settings; "env" before that; "fake" in local dev. */
  source: "database" | "env" | "fake";
  provider: GatewayName | "fake";
  environment: GatewayEnvironment;
  doku: Record<GatewayEnvironment, DokuKeys | null>;
  midtrans: Record<GatewayEnvironment, MidtransKeys | null>;
};

type Deps = { db: AppDatabase; env: ValidatedEnv };

/** A provider instance tagged with the environment it talks to. */
export type ResolvedProvider = {
  provider: PaymentProvider;
  environment: GatewayEnvironment | "local";
};

/** Column names double as the encryption binding for each secret. */
export const SECRET_FIELDS = {
  doku: {
    sandbox: "dokuSandboxSecretKey",
    production: "dokuProductionSecretKey",
  },
  midtrans: {
    sandbox: "midtransSandboxServerKey",
    production: "midtransProductionServerKey",
  },
} as const;

export const DOKU_CLIENT_ID_FIELDS = {
  sandbox: "dokuSandboxClientId",
  production: "dokuProductionClientId",
} as const;

async function openField(
  env: ValidatedEnv,
  row: PaymentConfigRow,
  field: keyof PaymentConfigRow
): Promise<string | null> {
  const sealed = row[field];
  if (typeof sealed !== "string" || !sealed) return null;
  if (!env.PAYMENT_CONFIG_KEY) {
    logger.warn("Stored payment key can't be read: PAYMENT_CONFIG_KEY unset", {
      field,
    });
    return null;
  }
  const value = await openSecret(env.PAYMENT_CONFIG_KEY, field, sealed);
  if (value === null)
    logger.warn("Stored payment key failed to decrypt", { field });
  return value;
}

/** Keys from Worker vars/secrets: the fallback before anything is saved. */
function envSettings(env: ValidatedEnv): PaymentSettings {
  const dokuEnv: GatewayEnvironment =
    env.DOKU_PRODUCTION === "true" ? "production" : "sandbox";
  const midtransEnv: GatewayEnvironment =
    env.MIDTRANS_PRODUCTION === "true" ? "production" : "sandbox";
  const doku: PaymentSettings["doku"] = { sandbox: null, production: null };
  const midtrans: PaymentSettings["midtrans"] = {
    sandbox: null,
    production: null,
  };
  if (env.DOKU_CLIENT_ID && env.DOKU_SECRET_KEY)
    doku[dokuEnv] = {
      clientId: env.DOKU_CLIENT_ID,
      secretKey: env.DOKU_SECRET_KEY,
    };
  if (env.MIDTRANS_SERVER_KEY)
    midtrans[midtransEnv] = { serverKey: env.MIDTRANS_SERVER_KEY };
  const provider = env.PAYMENT_MODE === "midtrans" ? "midtrans" : "doku";
  return {
    source: "env",
    provider,
    environment: provider === "midtrans" ? midtransEnv : dokuEnv,
    doku,
    midtrans,
  };
}

/**
 * Current payment settings. PAYMENT_MODE=fake (local dev) always wins. Else
 * the operator's saved settings, with any key slot they left empty filled
 * from the Worker env.
 */
export async function loadPaymentSettings({
  db,
  env,
}: Deps): Promise<PaymentSettings> {
  const fromEnv = envSettings(env);
  if (env.PAYMENT_MODE === "fake")
    return { ...fromEnv, source: "fake", provider: "fake" };
  const row = await getPaymentConfig(db);
  if (!row) return fromEnv;

  const settings: PaymentSettings = {
    source: "database",
    provider: row.provider,
    environment: row.environment,
    doku: { ...fromEnv.doku },
    midtrans: { ...fromEnv.midtrans },
  };
  for (const e of GATEWAY_ENVIRONMENTS) {
    const clientId = row[DOKU_CLIENT_ID_FIELDS[e]];
    const secretKey = await openField(env, row, SECRET_FIELDS.doku[e]);
    if (clientId && secretKey) settings.doku[e] = { clientId, secretKey };
    const serverKey = await openField(env, row, SECRET_FIELDS.midtrans[e]);
    if (serverKey) settings.midtrans[e] = { serverKey };
  }
  return settings;
}

export function buildProvider(
  settings: PaymentSettings,
  name: GatewayName,
  environment: GatewayEnvironment
): PaymentProvider | null {
  const production = environment === "production";
  if (name === "doku") {
    const keys = settings.doku[environment];
    return keys ? new DokuProvider({ ...keys, production }) : null;
  }
  const keys = settings.midtrans[environment];
  return keys ? new MidtransProvider({ ...keys, production }) : null;
}

function fakeProvider(env: ValidatedEnv): ResolvedProvider {
  return {
    provider: new FakePaymentProvider({
      baseUrl: env.BETTER_AUTH_URL,
      secret: `${env.BETTER_AUTH_SECRET}:payment`,
    }),
    environment: "local",
  };
}

/** The provider new checkouts go to. Throws PAYMENT_NOT_CONFIGURED without keys. */
export async function getCheckoutProvider(
  deps: Deps
): Promise<ResolvedProvider> {
  const settings = await loadPaymentSettings(deps);
  if (settings.provider === "fake") return fakeProvider(deps.env);
  const provider = buildProvider(
    settings,
    settings.provider,
    settings.environment
  );
  if (!provider)
    throw appError(
      "PAYMENT_NOT_CONFIGURED",
      "Payments are not set up yet. Please try again later."
    );
  return { provider, environment: settings.environment };
}

/**
 * Every configured instance of one gateway, active environment first. Used
 * for notifications and status checks: an order started before the operator
 * switched sandbox/production must still be verified with its own keys.
 */
export async function getGatewayProviders(
  deps: Deps,
  name: GatewayName | "fake",
  only?: GatewayEnvironment | null
): Promise<ResolvedProvider[]> {
  const settings = await loadPaymentSettings(deps);
  if (name === "fake")
    return settings.provider === "fake" ? [fakeProvider(deps.env)] : [];
  const order: GatewayEnvironment[] =
    settings.environment === "production"
      ? ["production", "sandbox"]
      : ["sandbox", "production"];
  const resolved: ResolvedProvider[] = [];
  for (const environment of order) {
    if (only && environment !== only) continue;
    const provider = buildProvider(settings, name, environment);
    if (provider) resolved.push({ provider, environment });
  }
  return resolved;
}
