// @vitest-environment node
import { createHash, createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  DOKU_NOTIFY_PATH,
  DokuProvider,
  dokuDigest,
  dokuSignature,
  dokuText,
  mapDokuStatus,
} from "./doku";

const CLIENT = "BRN-0001-TEST";
const SECRET = "SK-test-secret";

/** Reference signature built with node:crypto, independent of the code under test. */
function referenceSignature(lines: string[]) {
  return `HMACSHA256=${createHmac("sha256", SECRET).update(lines.join("\n")).digest("base64")}`;
}

function notification(status = "SUCCESS", amount = 399000) {
  const rawBody = JSON.stringify({
    order: { invoice_number: "MB-1", amount },
    transaction: { status },
    channel: { id: "VIRTUAL_ACCOUNT_BCA" },
  });
  const digest = createHash("sha256").update(rawBody).digest("base64");
  const headers = new Headers({
    "Client-Id": CLIENT,
    "Request-Id": "req-1",
    "Request-Timestamp": "2026-09-26T08:45:42Z",
    Signature: referenceSignature([
      `Client-Id:${CLIENT}`,
      "Request-Id:req-1",
      "Request-Timestamp:2026-09-26T08:45:42Z",
      `Request-Target:${DOKU_NOTIFY_PATH}`,
      `Digest:${digest}`,
    ]),
  });
  return { body: JSON.parse(rawBody), rawBody, headers };
}

function provider(fetch: ReturnType<typeof vi.fn>) {
  return new DokuProvider({
    clientId: CLIENT,
    secretKey: SECRET,
    production: false,
    fetch: fetch as unknown as typeof globalThis.fetch,
  });
}

describe("DOKU", () => {
  it("maps statuses", () => {
    expect(mapDokuStatus("SUCCESS")).toBe("paid");
    expect(mapDokuStatus("PENDING")).toBe("pending");
    expect(mapDokuStatus("EXPIRED")).toBe("expired");
    expect(mapDokuStatus("TIMEOUT")).toBe("expired");
    expect(mapDokuStatus("FAILED")).toBe("failed");
    expect(mapDokuStatus("REFUNDED")).toBe("refunded");
  });

  it("cleans text to DOKU's allowed characters", () => {
    expect(dokuText("order — Plan & Feature")).toBe("order - Plan dan Feature");
    expect(dokuText("José’s 🎉 party!")).toBe("Jose's party");
    expect(dokuText("🎉")).toBe("SaaS Platform");
  });

  it("signs like the reference implementation", async () => {
    const body = '{"a":1}';
    const digest = await dokuDigest(body);
    expect(digest).toBe(createHash("sha256").update(body).digest("base64"));
    const c = {
      clientId: CLIENT,
      requestId: "r",
      timestamp: "2026-09-26T00:00:00Z",
      target: "/checkout/v1/payment",
    };
    expect(await dokuSignature({ ...c, digest }, SECRET)).toBe(
      referenceSignature([
        `Client-Id:${CLIENT}`,
        "Request-Id:r",
        "Request-Timestamp:2026-09-26T00:00:00Z",
        "Request-Target:/checkout/v1/payment",
        `Digest:${digest}`,
      ])
    );
    // GET requests have no Digest line.
    expect(await dokuSignature(c, SECRET)).toBe(
      referenceSignature([
        `Client-Id:${CLIENT}`,
        "Request-Id:r",
        "Request-Timestamp:2026-09-26T00:00:00Z",
        "Request-Target:/checkout/v1/payment",
      ])
    );
  });

  it("accepts a signed notification and re-reads the status", async () => {
    const fetch = vi.fn(async () =>
      Response.json({
        order: { invoice_number: "MB-1", amount: 399000 },
        transaction: { status: "SUCCESS" },
        channel: { id: "QRIS" },
      })
    );
    const n = notification();
    expect(await provider(fetch).verifyNotification(n.body, n)).toEqual({
      orderId: "MB-1",
      status: "paid",
      method: "QRIS",
      amountIdr: 399000,
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://api-sandbox.doku.com/orders/v1/status/MB-1",
      expect.anything()
    );
  });

  it("keeps a signed SUCCESS when the status API still says pending", async () => {
    const fetch = vi.fn(async () =>
      Response.json({ transaction: { status: "PENDING" } })
    );
    const n = notification();
    const result = await provider(fetch).verifyNotification(n.body, n);
    expect(result?.status).toBe("paid");
  });

  it("rejects a tampered body without calling DOKU", async () => {
    const fetch = vi.fn();
    const n = notification();
    const rawBody = n.rawBody.replace("399000", "1000");
    expect(
      await provider(fetch).verifyNotification(JSON.parse(rawBody), {
        rawBody,
        headers: n.headers,
      })
    ).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a notification without headers", async () => {
    const fetch = vi.fn();
    const n = notification();
    expect(await provider(fetch).verifyNotification(n.body)).toBeNull();
  });

  it("creates a checkout and returns the payment url", async () => {
    const fetch = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe("https://api-sandbox.doku.com/checkout/v1/payment");
      const headers = init.headers as Record<string, string>;
      const body = String(init.body);
      expect(headers.Signature).toBe(
        referenceSignature([
          `Client-Id:${CLIENT}`,
          `Request-Id:${headers["Request-Id"]}`,
          `Request-Timestamp:${headers["Request-Timestamp"]}`,
          "Request-Target:/checkout/v1/payment",
          `Digest:${createHash("sha256").update(body).digest("base64")}`,
        ])
      );
      expect(headers["Request-Timestamp"]).toMatch(
        /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/
      );
      const json = JSON.parse(body);
      expect(json.order.line_items[0].name).toBe("order - Plan dan Feature");
      expect(json.order).toMatchObject({
        amount: 399000,
        invoice_number: "MB-1",
        callback_url: "https://example.com/checkout/finish?paid=MB-1",
      });
      return Response.json({
        response: { payment: { url: "https://sandbox.doku.com/pay/abc" } },
      });
    });
    expect(
      await provider(fetch).createCheckout({
        orderId: "MB-1",
        amountIdr: 399000,
        itemName: "order — Plan & Feature",
        customer: { name: "Rina", email: "rina@example.com" },
        finishUrl: "https://example.com/checkout/finish?paid=MB-1",
      })
    ).toEqual({ redirectUrl: "https://sandbox.doku.com/pay/abc" });
  });

  it("reads an order's status for the no-webhook fallback", async () => {
    const fetch = vi.fn(async () =>
      Response.json({
        order: { invoice_number: "MB-1", amount: 399000 },
        transaction: { status: "SUCCESS" },
        channel: { id: "QRIS" },
      })
    );
    expect(await provider(fetch).checkStatus("MB-1")).toEqual({
      orderId: "MB-1",
      status: "paid",
      method: "QRIS",
      amountIdr: 399000,
    });
    const missing = vi.fn(
      async () => new Response("Not found", { status: 404 })
    );
    expect(await provider(missing).checkStatus("MB-1")).toBeNull();
  });

  it("probe: not-found means the keys work, auth errors mean they don't", async () => {
    const notFound = vi.fn(
      async () =>
        new Response('{"error":{"message":"Order not found"}}', { status: 404 })
    );
    expect(await provider(notFound).probe()).toEqual({ ok: true });
    const badId = vi.fn(async () =>
      Response.json(
        { error: { code: "invalid_client_id", message: "Invalid Client-Id" } },
        { status: 400 }
      )
    );
    const result = await provider(badId).probe();
    expect(result.ok).toBe(false);
    expect(!result.ok && result.detail).toContain("invalid_client_id");
  });
});
