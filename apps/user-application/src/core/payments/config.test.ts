// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaymentConfigRow } from "@repo/data-ops/queries/payment-config";
import type { ValidatedEnv } from "@/core/env";
import {
  getCheckoutProvider,
  getGatewayProviders,
  loadPaymentSettings,
} from "./config";
import { sealSecret } from "./secret-box";

let row: PaymentConfigRow | null = null;
vi.mock("@repo/data-ops/queries/payment-config", () => ({
  getPaymentConfig: async () => row,
}));

const CONFIG_KEY = "c".repeat(40);
const db = {} as never;

function env(over: Partial<ValidatedEnv> = {}): ValidatedEnv {
  return {
    BETTER_AUTH_URL: "https://example.com",
    BETTER_AUTH_SECRET: "s".repeat(40),
    PLATFORM_ADMIN_EMAILS: "admin@example.com",
    PAYMENT_MODE: "doku",
    DOKU_PRODUCTION: "false",
    MIDTRANS_PRODUCTION: "false",
    PAYMENT_CONFIG_KEY: CONFIG_KEY,
    ...over,
  } as ValidatedEnv;
}

async function savedRow(
  over: Partial<PaymentConfigRow> = {}
): Promise<PaymentConfigRow> {
  return {
    id: "default",
    provider: "doku",
    environment: "sandbox",
    dokuSandboxClientId: "BRN-SB",
    dokuSandboxSecretKey: await sealSecret(
      CONFIG_KEY,
      "dokuSandboxSecretKey",
      "SK-sb"
    ),
    dokuProductionClientId: null,
    dokuProductionSecretKey: null,
    midtransSandboxServerKey: null,
    midtransProductionServerKey: null,
    updatedAt: 0,
    updatedBy: null,
    ...over,
  };
}

beforeEach(() => {
  row = null;
});

describe("payment settings", () => {
  it("falls back to Worker env keys before anything is saved", async () => {
    const s = await loadPaymentSettings({
      db,
      env: env({ DOKU_CLIENT_ID: "BRN-ENV", DOKU_SECRET_KEY: "SK-env" }),
    });
    expect(s.source).toBe("env");
    expect(s.doku.sandbox).toEqual({
      clientId: "BRN-ENV",
      secretKey: "SK-env",
    });
    expect(s.doku.production).toBeNull();
  });

  it("uses saved keys and fills empty slots from env", async () => {
    row = await savedRow();
    const s = await loadPaymentSettings({
      db,
      env: env({ MIDTRANS_SERVER_KEY: "SB-Mid-env" }),
    });
    expect(s.source).toBe("database");
    expect(s.doku.sandbox).toEqual({ clientId: "BRN-SB", secretKey: "SK-sb" });
    expect(s.midtrans.sandbox).toEqual({ serverKey: "SB-Mid-env" });
  });

  it("treats a key sealed with another PAYMENT_CONFIG_KEY as missing", async () => {
    row = await savedRow();
    const s = await loadPaymentSettings({
      db,
      env: env({ PAYMENT_CONFIG_KEY: "z".repeat(40) }),
    });
    expect(s.doku.sandbox).toBeNull();
  });

  it("PAYMENT_MODE=fake always wins (local dev)", async () => {
    row = await savedRow();
    const e = env({ PAYMENT_MODE: "fake" });
    const { provider, environment } = await getCheckoutProvider({ db, env: e });
    expect(provider.name).toBe("fake");
    expect(environment).toBe("local");
    expect(await getGatewayProviders({ db, env: e }, "doku")).toEqual([]);
  });

  it("refuses checkout when the active mode has no keys", async () => {
    row = await savedRow({ environment: "production" });
    await expect(getCheckoutProvider({ db, env: env() })).rejects.toMatchObject(
      {
        code: "PAYMENT_NOT_CONFIGURED",
      }
    );
  });

  it("verifies with every configured environment, active one first", async () => {
    row = await savedRow({
      environment: "production",
      dokuProductionClientId: "BRN-PROD",
      dokuProductionSecretKey: await sealSecret(
        CONFIG_KEY,
        "dokuProductionSecretKey",
        "SK-prod"
      ),
    });
    const all = await getGatewayProviders({ db, env: env() }, "doku");
    expect(all.map((p) => p.environment)).toEqual(["production", "sandbox"]);
    const onlySandbox = await getGatewayProviders(
      { db, env: env() },
      "doku",
      "sandbox"
    );
    expect(onlySandbox.map((p) => p.environment)).toEqual(["sandbox"]);
  });
});
