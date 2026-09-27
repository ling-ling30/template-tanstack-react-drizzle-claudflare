import { appError } from "@repo/data-ops/errors";
import { recordAuditLog } from "@repo/data-ops/queries/audit-logs";
import {
  getPaymentConfig,
  savePaymentConfig,
  type PaymentCredentialField,
} from "@repo/data-ops/queries/payment-config";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePlatformAdmin } from "@/core/auth/platform";
import {
  buildProvider,
  DOKU_CLIENT_ID_FIELDS,
  GATEWAY_ENVIRONMENTS,
  loadPaymentSettings,
  SECRET_FIELDS,
  type GatewayEnvironment,
} from "@/core/payments/config";
import { DOKU_NOTIFY_PATH } from "@/core/payments/doku";
import { sealSecret } from "@/core/payments/secret-box";
import { getRuntime } from "@/core/runtime";
import { zodInput } from "@/core/validation/zod-input";
import {
  paymentConfigInputSchema,
  type PaymentKeySlot,
} from "@repo/data-ops/zod-schema/payment-config";

type SplitSlot<S extends string> = S extends `${infer N}.${infer E}`
  ? [N & ("doku" | "midtrans"), E & GatewayEnvironment]
  : never;

export type KeyState = "saved" | "env" | "unreadable" | "missing";

const gateway = z.enum(["doku", "midtrans"]);
const environment = z.enum(["sandbox", "production"]);

/**
 * Payment gateway settings for the operator dashboard. Secret keys never
 * leave the server: only whether each one is set, and where from.
 */
export const getPaymentConfigFn = createServerFn({ method: "GET" }).handler(
  async () => {
    await requirePlatformAdmin();
    const runtime = getRuntime();
    const row = await getPaymentConfig(runtime.db);
    const settings = await loadPaymentSettings(runtime);

    const state = (
      stored: string | null | undefined,
      effective: boolean
    ): KeyState =>
      stored
        ? effective
          ? "saved"
          : "unreadable"
        : effective
          ? "env"
          : "missing";

    const perEnv = <T>(fn: (e: GatewayEnvironment) => T) =>
      Object.fromEntries(GATEWAY_ENVIRONMENTS.map((e) => [e, fn(e)])) as Record<
        GatewayEnvironment,
        T
      >;

    const base = runtime.env.BETTER_AUTH_URL.replace(/\/$/, "");
    return {
      source: settings.source,
      provider: settings.provider,
      environment: settings.environment,
      configKeySet: Boolean(runtime.env.PAYMENT_CONFIG_KEY),
      updatedAt: row?.updatedAt ?? null,
      doku: perEnv((e) => ({
        clientId: settings.doku[e]?.clientId ?? "",
        secretKey: state(row?.[SECRET_FIELDS.doku[e]], !!settings.doku[e]),
      })),
      midtrans: perEnv((e) => ({
        serverKey: state(
          row?.[SECRET_FIELDS.midtrans[e]],
          !!settings.midtrans[e]
        ),
      })),
      notifyUrls: {
        doku: `${base}${DOKU_NOTIFY_PATH}`,
        midtrans: `${base}/api/payments/midtrans`,
      },
    };
  }
);

/**
 * Saves gateway settings. Secret fields: empty keeps the saved value; listed
 * in `clear` removes it. Keys are encrypted with PAYMENT_CONFIG_KEY.
 */
export const savePaymentConfigFn = createServerFn({ method: "POST" })
  .validator(zodInput(paymentConfigInputSchema))
  .handler(async ({ data }) => {
    const admin = await requirePlatformAdmin();
    const runtime = getRuntime();
    const configKey = runtime.env.PAYMENT_CONFIG_KEY;

    const credentials: Partial<Record<PaymentCredentialField, string | null>> =
      {};
    const changed: string[] = [];
    const seal = async (
      field: PaymentCredentialField,
      value: string | undefined
    ) => {
      if (!value) return;
      if (!configKey)
        throw appError(
          "PAYMENT_CONFIG_KEY_MISSING",
          "Set the PAYMENT_CONFIG_KEY Worker secret before saving keys."
        );
      credentials[field] = await sealSecret(configKey, field, value);
      changed.push(field);
    };

    for (const e of GATEWAY_ENVIRONMENTS) {
      credentials[DOKU_CLIENT_ID_FIELDS[e]] = data.doku[e].clientId || null;
      await seal(SECRET_FIELDS.doku[e], data.doku[e].secretKey);
      await seal(SECRET_FIELDS.midtrans[e], data.midtrans[e].serverKey);
    }
    for (const slot of data.clear) {
      const parts = slot.split(".") as SplitSlot<PaymentKeySlot>;
      const name = parts[0];
      const e = parts[1];
      credentials[SECRET_FIELDS[name][e]] = null;
      if (name === "doku") credentials[DOKU_CLIENT_ID_FIELDS[e]] = null;
      changed.push(`cleared:${slot}`);
    }

    const now = Date.now();
    await savePaymentConfig(runtime.db, {
      provider: data.provider,
      environment: data.environment,
      credentials,
      updatedBy: admin.id,
      now,
    });

    await recordAuditLog(runtime.db, {
      actorId: admin.id,
      action: "payment_config.update",
      resourceType: "payment_config",
      resourceId: "default",
      metadata: JSON.stringify({
        provider: data.provider,
        environment: data.environment,
        changed,
      }),
    });

    const settings = await loadPaymentSettings(runtime);
    return {
      ready: Boolean(buildProvider(settings, data.provider, data.environment)),
    };
  });

/** Checks saved keys against the gateway without creating a payment. */
export const testPaymentConfigFn = createServerFn({ method: "POST" })
  .validator(zodInput(z.object({ provider: gateway, environment })))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    const runtime = getRuntime();
    const settings = await loadPaymentSettings(runtime);
    const provider = buildProvider(settings, data.provider, data.environment);
    if (!provider) return { ok: false as const, detail: "missing" };
    return provider.probe();
  });
