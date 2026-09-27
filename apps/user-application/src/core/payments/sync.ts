import type { AppDatabase } from "@repo/data-ops/database/setup";
import { recordAuditLog } from "@repo/data-ops/queries/audit-logs";
import {
  getPaymentByOrderId,
  listPendingPaymentsToSync,
  updatePaymentStatus,
} from "@repo/data-ops/queries/payments";
import type { PaymentRow } from "@repo/data-ops/drizzle/payments-schema";
import type { ValidatedEnv } from "@/core/env";
import { logger } from "@/core/logger/logger";
import {
  getGatewayProviders,
  type GatewayEnvironment,
  type GatewayName,
} from "./config";
import type { NotificationRequest, VerifiedNotification } from "./provider";

export type PaymentNotificationHook = (
  payment: PaymentRow,
  notification: VerifiedNotification
) => Promise<void>;

let paymentSettledHook: PaymentNotificationHook | null = null;

/** Registers an application callback invoked whenever a payment settles (e.g. upgrading a subscription). */
export function setPaymentSettledHook(hook: PaymentNotificationHook | null) {
  paymentSettledHook = hook;
}

type Deps = {
  db: AppDatabase;
  env: ValidatedEnv;
  now: number;
};

export function orderMatchesGateway(
  pay: Pick<PaymentRow, "provider" | "providerEnv">,
  gateway: GatewayName | "fake",
  environment: GatewayEnvironment | "local"
): boolean {
  if (pay.provider !== gateway) return false;
  if (pay.providerEnv == null) return true;
  return pay.providerEnv === environment;
}

/**
 * Verifies a gateway webhook with every configured key set for that gateway
 * (sandbox and production), then applies it. Returns the HTTP status to send:
 * 404 when the gateway isn't set up, 403 when nothing verifies it.
 */
export async function handleGatewayNotification(
  deps: Deps,
  name: GatewayName | "fake",
  body: unknown,
  request?: NotificationRequest
): Promise<200 | 403 | 404> {
  const providers = await getGatewayProviders(deps, name);
  if (providers.length === 0) return 404;

  let verified: VerifiedNotification | null = null;
  for (const { provider, environment } of providers) {
    const candidate = await provider.verifyNotification(body, request);
    if (!candidate) continue;

    // An order only settles through the gateway and environment it was
    // created in: a sandbox payment must never activate a production order.
    const pay = await getPaymentByOrderId(deps.db, candidate.orderId);
    if (pay && !orderMatchesGateway(pay, name, environment)) {
      logger.warn("Payment notification from the wrong gateway environment", {
        orderId: candidate.orderId,
        gateway: name,
        environment,
        orderGateway: pay.provider,
        orderEnvironment: pay.providerEnv,
      });
      continue;
    }
    verified = candidate;
    break;
  }

  if (!verified) {
    logger.warn("Rejected payment notification", { gateway: name });
    return 403;
  }

  await applyPaymentNotification(deps, verified);
  return 200;
}

export async function applyPaymentNotification(
  deps: Deps,
  n: VerifiedNotification
): Promise<void> {
  const pay = await getPaymentByOrderId(deps.db, n.orderId);

  if (n.status === "expired" || n.status === "failed") {
    if (pay) {
      await updatePaymentStatus(deps.db, {
        orderId: n.orderId,
        status: n.status,
        now: deps.now,
      });
    }
    return;
  }

  if (n.status === "refunded") {
    if (pay) {
      await updatePaymentStatus(deps.db, {
        orderId: n.orderId,
        status: "refunded",
        now: deps.now,
      });
      await recordAuditLog(deps.db, {
        actorId: "system:gateway",
        action: "payment.refunded",
        resourceType: "payment",
        resourceId: n.orderId,
        organizationId: pay.organizationId ?? undefined,
        metadata: JSON.stringify({ amountIdr: n.amountIdr, method: n.method }),
      });
    }
    return;
  }

  if (n.status !== "paid") return;

  if (!pay) {
    logger.warn("Paid notification for an unknown order", {
      orderId: n.orderId,
    });
    return;
  }

  if (pay.amountIdr !== n.amountIdr) {
    logger.error("Paid amount does not match the order", undefined, {
      orderId: n.orderId,
      expected: pay.amountIdr,
      paid: n.amountIdr,
    });
    return;
  }

  // Already settled
  if (pay.status === "paid") {
    return;
  }

  await updatePaymentStatus(deps.db, {
    orderId: n.orderId,
    status: "paid",
    method: n.method,
    paidAt: deps.now,
    now: deps.now,
  });

  await recordAuditLog(deps.db, {
    actorId: pay.userId ?? "system:gateway",
    action: "payment.settled",
    resourceType: "payment",
    resourceId: n.orderId,
    organizationId: pay.organizationId ?? undefined,
    metadata: JSON.stringify({
      amountIdr: n.amountIdr,
      method: n.method,
      provider: pay.provider,
    }),
  });

  if (paymentSettledHook) {
    try {
      await paymentSettledHook(pay, n);
    } catch (err) {
      logger.error("paymentSettledHook failed", err, { orderId: n.orderId });
    }
  }
}

/**
 * Asks the gateway for one pending payment's status and applies the answer.
 * The fallback both DOKU and Midtrans recommend for when their notification
 * does not arrive.
 */
export async function syncPaymentStatus(
  deps: Deps,
  pay: PaymentRow
): Promise<VerifiedNotification["status"] | null> {
  if (pay.status !== "pending") return null;
  if (pay.provider !== "doku" && pay.provider !== "midtrans") return null;
  const env =
    pay.providerEnv === "sandbox" || pay.providerEnv === "production"
      ? (pay.providerEnv as GatewayEnvironment)
      : null;
  const providers = await getGatewayProviders(
    deps,
    pay.provider as GatewayName,
    env
  );
  for (const { provider } of providers) {
    try {
      const found = await provider.checkStatus(
        pay.providerOrderId ?? pay.orderId
      );
      if (!found) continue;
      if (found.status !== "pending") {
        await applyPaymentNotification(deps, found);
      }
      return found.status;
    } catch (error) {
      logger.warn("Payment status check failed", {
        orderId: pay.orderId,
        error: String(error),
      });
    }
  }
  return null;
}

export const SYNC_LOOKBACK_MS = 26 * 60 * 60 * 1000;
export const SYNC_MIN_AGE_MS = 2 * 60 * 1000;

export async function syncPendingPayments(deps: Deps): Promise<number> {
  const pending = await listPendingPaymentsToSync(deps.db, {
    since: deps.now - SYNC_LOOKBACK_MS,
    before: deps.now - SYNC_MIN_AGE_MS,
    limit: 50,
  });
  let settled = 0;
  for (const pay of pending) {
    const status = await syncPaymentStatus(deps, pay);
    if (status && status !== "pending") settled++;
  }
  return settled;
}
