import { describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "../database/setup";
import { getPaymentConfig, savePaymentConfig } from "./payment-config";

describe("paymentConfig queries", () => {
  it("returns null when no row exists", async () => {
    const limit = vi.fn().mockResolvedValue([]);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });
    const db = { select } as unknown as AppDatabase;

    const res = await getPaymentConfig(db);
    expect(res).toBeNull();
  });

  it("saves payment config with conflict update", async () => {
    const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
    const insert = vi.fn().mockReturnValue({ values });
    const db = { insert } as unknown as AppDatabase;

    await savePaymentConfig(db, {
      provider: "midtrans",
      environment: "sandbox",
      credentials: {
        midtransSandboxServerKey: "sealed-key",
      },
      updatedBy: "usr_admin",
      now: 123456789,
    });

    expect(insert).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "default",
        provider: "midtrans",
        environment: "sandbox",
        midtransSandboxServerKey: "sealed-key",
      })
    );
  });
});
