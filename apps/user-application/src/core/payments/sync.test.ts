// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "@repo/data-ops/database/setup";
import type { ValidatedEnv } from "@/core/env";
import {
  handleGatewayNotification,
  orderMatchesGateway,
  setPaymentSettledHook,
} from "./sync";

vi.mock("@/core/payments/config", () => ({
  getGatewayProviders: async () => [
    {
      environment: "sandbox",
      provider: {
        name: "midtrans",
        verifyNotification: async (body: unknown) => {
          if (
            body &&
            typeof body === "object" &&
            (body as { valid?: boolean }).valid
          ) {
            return {
              orderId: "ord_100",
              status: "paid",
              method: "qris",
              amountIdr: 100000,
            };
          }
          return null;
        },
      },
    },
  ],
}));

let mockPayment: {
  orderId: string;
  amountIdr: number;
  provider: string;
  providerEnv: string;
  status: string;
  organizationId: string | null;
  userId: string | null;
} | null = null;

vi.mock("@repo/data-ops/queries/payments", () => ({
  getPaymentByOrderId: async () => mockPayment,
  updatePaymentStatus: vi.fn(async () => undefined),
  listPendingPaymentsToSync: async () => [],
}));

vi.mock("@repo/data-ops/queries/audit-logs", () => ({
  recordAuditLog: vi.fn(async () => undefined),
}));

describe("payment sync", () => {
  it("validates order matches gateway and environment", () => {
    expect(
      orderMatchesGateway(
        { provider: "midtrans", providerEnv: "sandbox" },
        "midtrans",
        "sandbox"
      )
    ).toBe(true);
    expect(
      orderMatchesGateway(
        { provider: "midtrans", providerEnv: "production" },
        "midtrans",
        "sandbox"
      )
    ).toBe(false);
    expect(
      orderMatchesGateway(
        { provider: "doku", providerEnv: "sandbox" },
        "midtrans",
        "sandbox"
      )
    ).toBe(false);
  });

  it("handles valid gateway notification and calls payment hook", async () => {
    mockPayment = {
      orderId: "ord_100",
      amountIdr: 100000,
      provider: "midtrans",
      providerEnv: "sandbox",
      status: "pending",
      organizationId: "org_1",
      userId: "usr_1",
    };

    const hook = vi.fn().mockResolvedValue(undefined);
    setPaymentSettledHook(hook);

    const status = await handleGatewayNotification(
      { db: {} as AppDatabase, env: {} as ValidatedEnv, now: 123456 },
      "midtrans",
      { valid: true }
    );

    expect(status).toBe(200);
    expect(hook).toHaveBeenCalledOnce();
    setPaymentSettledHook(null);
  });

  it("rejects invalid webhook signature with 403", async () => {
    const status = await handleGatewayNotification(
      { db: {} as AppDatabase, env: {} as ValidatedEnv, now: 123456 },
      "midtrans",
      { valid: false }
    );

    expect(status).toBe(403);
  });
});
