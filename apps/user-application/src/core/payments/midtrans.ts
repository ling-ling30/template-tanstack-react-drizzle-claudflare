import type {
  CheckoutRequest,
  PaymentProvider,
  ProbeResult,
  ProviderStatus,
  VerifiedNotification,
} from "./provider";

/** QRIS first, then bank Virtual Accounts; no cards, no direct e-wallets. */
export const MIDTRANS_ENABLED_PAYMENTS = [
  "other_qris",
  "bca_va",
  "bni_va",
  "bri_va",
  "echannel",
  "permata_va",
];

type MidtransNotification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
};

export function mapMidtransStatus(
  transactionStatus: string | undefined,
  fraudStatus?: string
): ProviderStatus {
  switch (transactionStatus) {
    case "settlement":
      return "paid";
    case "capture":
      return fraudStatus === "accept" || !fraudStatus ? "paid" : "pending";
    case "pending":
      return "pending";
    case "expire":
      return "expired";
    case "refund":
    case "partial_refund":
      return "refunded";
    default:
      return "failed"; // deny, cancel, failure
  }
}

async function sha512Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(input)
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Midtrans signature: SHA512(order_id + status_code + gross_amount + server_key). */
export async function midtransSignature(
  n: { orderId: string; statusCode: string; grossAmount: string },
  serverKey: string
): Promise<string> {
  return sha512Hex(`${n.orderId}${n.statusCode}${n.grossAmount}${serverKey}`);
}

export class MidtransProvider implements PaymentProvider {
  readonly name = "midtrans";

  constructor(
    private readonly config: {
      serverKey: string;
      production: boolean;
      fetch?: typeof fetch;
    }
  ) {}

  private get auth() {
    return `Basic ${btoa(`${this.config.serverKey}:`)}`;
  }

  private get http() {
    return this.config.fetch ?? ((input, init) => fetch(input, init));
  }

  async createCheckout(r: CheckoutRequest): Promise<{ redirectUrl: string }> {
    const base = this.config.production
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";
    const res = await this.http(`${base}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        transaction_details: { order_id: r.orderId, gross_amount: r.amountIdr },
        item_details: [
          {
            id: r.orderId,
            price: r.amountIdr,
            quantity: 1,
            name: r.itemName.slice(0, 50),
          },
        ],
        customer_details: {
          first_name: r.customer.name.slice(0, 50),
          email: r.customer.email,
        },
        enabled_payments: MIDTRANS_ENABLED_PAYMENTS,
        expiry: { unit: "hours", duration: 24 },
        callbacks: { finish: r.finishUrl },
      }),
    });
    if (!res.ok) throw new Error(`Midtrans checkout failed: ${res.status}`);
    const data = (await res.json()) as { redirect_url?: string };
    if (!data.redirect_url)
      throw new Error("Midtrans checkout: no redirect_url returned");
    return { redirectUrl: data.redirect_url };
  }

  async verifyNotification(
    body: unknown
  ): Promise<VerifiedNotification | null> {
    const n = body as MidtransNotification;
    if (!n?.order_id || !n.status_code || !n.gross_amount || !n.signature_key)
      return null;
    const expected = await midtransSignature(
      {
        orderId: n.order_id,
        statusCode: n.status_code,
        grossAmount: n.gross_amount,
      },
      this.config.serverKey
    );
    if (expected !== n.signature_key) return null;

    // Never trust the body alone: re-read the status from Midtrans directly.
    return this.checkStatus(n.order_id);
  }

  async checkStatus(orderId: string): Promise<VerifiedNotification | null> {
    const res = await this.fetchStatus(orderId);
    if (!res.ok) return null;
    const s = (await res.json()) as MidtransNotification;
    // Midtrans returns 200 with status_code "404" for unknown orders.
    if (s.order_id !== orderId || !s.gross_amount) return null;
    return {
      orderId,
      status: mapMidtransStatus(s.transaction_status, s.fraud_status),
      method: s.payment_type ?? null,
      amountIdr: Math.round(Number(s.gross_amount)),
    };
  }

  /**
   * Asks for the status of a non-existent probe order: Midtrans answers
   * "not found" when the key is right, and 401 when it isn't.
   */
  async probe(): Promise<ProbeResult> {
    try {
      const res = await this.fetchStatus(`PROBE-${crypto.randomUUID()}`);
      const body = (await res.json().catch(() => ({}))) as {
        status_code?: string;
        status_message?: string;
      };
      const code = body.status_code ?? String(res.status);
      return code === "404"
        ? { ok: true }
        : { ok: false, detail: `${code} ${body.status_message ?? ""}`.trim() };
    } catch (error) {
      return { ok: false, detail: String(error) };
    }
  }

  private fetchStatus(orderId: string) {
    const api = this.config.production
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";
    return this.http(`${api}/v2/${encodeURIComponent(orderId)}/status`, {
      headers: { Authorization: this.auth, Accept: "application/json" },
    });
  }
}
