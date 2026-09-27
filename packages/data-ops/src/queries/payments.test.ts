import { describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "../database/setup";
import {
  createPaymentRecord,
  getPaymentByOrderId,
  updatePaymentStatus,
} from "./payments";

describe("payments queries", () => {
  it("creates a payment record with pending status", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn().mockReturnValue({ values });
    const db = { insert } as unknown as AppDatabase;

    const row = await createPaymentRecord(db, {
      orderId: "ord_123",
      amountIdr: 150000,
      provider: "midtrans",
      providerEnv: "sandbox",
    });

    expect(insert).toHaveBeenCalledOnce();
    expect(row.orderId).toBe("ord_123");
    expect(row.amountIdr).toBe(150000);
    expect(row.status).toBe("pending");
  });

  it("fetches payment by orderId", async () => {
    const limit = vi.fn().mockResolvedValue([{ orderId: "ord_123" }]);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });
    const db = { select } as unknown as AppDatabase;

    const res = await getPaymentByOrderId(db, "ord_123");
    expect(res).toEqual({ orderId: "ord_123" });
  });

  it("updates payment status to paid", async () => {
    const where = vi.fn().mockResolvedValue(undefined);
    const set = vi.fn().mockReturnValue({ where });
    const update = vi.fn().mockReturnValue({ set });
    const db = { update } as unknown as AppDatabase;

    await updatePaymentStatus(db, {
      orderId: "ord_123",
      status: "paid",
      method: "qris",
      paidAt: 123456789,
    });

    expect(update).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "paid",
        method: "qris",
        paidAt: 123456789,
      })
    );
  });
});
