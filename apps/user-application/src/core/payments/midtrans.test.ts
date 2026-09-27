// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  MidtransProvider,
  mapMidtransStatus,
  midtransSignature,
} from "./midtrans";

const KEY = "SB-Mid-server-test";

async function notification(overrides: Record<string, string> = {}) {
  const base = {
    order_id: "MB-1",
    status_code: "200",
    gross_amount: "399000.00",
    transaction_status: "settlement",
  };
  const n = { ...base, ...overrides };
  return {
    ...n,
    signature_key: await midtransSignature(
      {
        orderId: n.order_id,
        statusCode: n.status_code,
        grossAmount: n.gross_amount,
      },
      KEY
    ),
  };
}

describe("Midtrans", () => {
  it("maps transaction statuses", () => {
    expect(mapMidtransStatus("settlement")).toBe("paid");
    expect(mapMidtransStatus("capture", "accept")).toBe("paid");
    expect(mapMidtransStatus("capture", "challenge")).toBe("pending");
    expect(mapMidtransStatus("expire")).toBe("expired");
    expect(mapMidtransStatus("deny")).toBe("failed");
    expect(mapMidtransStatus("refund")).toBe("refunded");
  });

  it("verifies the signature and trusts the re-read status, not the body", async () => {
    const fetch = vi.fn(async () =>
      Response.json({
        order_id: "MB-1",
        transaction_status: "pending",
        gross_amount: "399000.00",
        payment_type: "qris",
      })
    );
    const provider = new MidtransProvider({
      serverKey: KEY,
      production: false,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });
    const result = await provider.verifyNotification(await notification());
    expect(result).toEqual({
      orderId: "MB-1",
      status: "pending",
      method: "qris",
      amountIdr: 399000,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.sandbox.midtrans.com/v2/MB-1/status",
      expect.anything()
    );
  });

  it("rejects a forged signature without calling Midtrans", async () => {
    const fetch = vi.fn();
    const provider = new MidtransProvider({
      serverKey: KEY,
      production: false,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });
    const forged = { ...(await notification()), gross_amount: "1.00" };
    expect(await provider.verifyNotification(forged)).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates a QRIS/VA-only Snap checkout", async () => {
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      expect(body.enabled_payments).toContain("other_qris");
      expect(body.enabled_payments).not.toContain("credit_card");
      expect(body.transaction_details).toEqual({
        order_id: "MB-1",
        gross_amount: 399000,
      });
      return Response.json({
        token: "t",
        redirect_url: "https://app.sandbox.midtrans.com/snap/v4/x",
      });
    });
    const provider = new MidtransProvider({
      serverKey: KEY,
      production: false,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });
    const out = await provider.createCheckout({
      orderId: "MB-1",
      amountIdr: 399000,
      itemName: "subscription",
      customer: { name: "Rina", email: "r@x.id" },
      finishUrl: "http://localhost:3030/dashboard",
    });
    expect(out.redirectUrl).toContain("snap");
  });

  it("probe: Midtrans' 404 for an unknown order means the key works", async () => {
    const make = (body: object, status = 200) =>
      new MidtransProvider({
        serverKey: KEY,
        production: false,
        fetch: vi.fn(async () =>
          Response.json(body, { status })
        ) as unknown as typeof globalThis.fetch,
      });
    expect(
      await make({ status_code: "404", status_message: "not found" }).probe()
    ).toEqual({ ok: true });
    expect(
      await make(
        { status_code: "401", status_message: "Unauthorized" },
        401
      ).probe()
    ).toEqual({ ok: false, detail: "401 Unauthorized" });
  });
});
