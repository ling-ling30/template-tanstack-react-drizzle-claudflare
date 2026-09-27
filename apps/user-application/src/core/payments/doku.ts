import type {
  CheckoutRequest,
  NotificationRequest,
  PaymentProvider,
  ProbeResult,
  ProviderStatus,
  VerifiedNotification,
} from "./provider";

/** Where DOKU posts payment notifications (configured in DOKU Back Office). */
export const DOKU_NOTIFY_PATH = "/api/payments/doku";

const CHECKOUT_PATH = "/checkout/v1/payment";
const STATUS_PATH = "/orders/v1/status/";

type DokuStatusBody = {
  order?: { invoice_number?: string; amount?: number | string };
  transaction?: { status?: string };
  channel?: { id?: string };
  service?: { id?: string };
};

export function mapDokuStatus(status: string | undefined): ProviderStatus {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "paid";
    case "EXPIRED":
    case "TIMEOUT":
      return "expired";
    case "REFUNDED":
      return "refunded";
    case "FAILED":
      return "failed";
    default:
      return "pending"; // PENDING, REDIRECT, unknown
  }
}

/**
 * DOKU rejects characters outside a-z A-Z 0-9 space . - / + , = _ : ' @ % ( ).
 * Accents lose their marks, dashes become "-", "&" becomes "dan", and
 * other characters are sanitized.
 */
export function dokuText(input: string, max = 50): string {
  const cleaned = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2012-\u2015]/g, "-")
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/&/g, " dan ")
    .replace(/[^a-zA-Z0-9 .\-/+,=_:'@%()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
  return cleaned || "SaaS Platform";
}

function toBase64(bytes: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s);
}

/** Digest header value: base64(SHA-256(body)). */
export async function dokuDigest(body: string): Promise<string> {
  return toBase64(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body))
  );
}

/**
 * DOKU non-SNAP signature: HMAC-SHA256 over the component lines, base64,
 * prefixed with "HMACSHA256=". GET requests have no Digest line.
 */
export async function dokuSignature(
  c: {
    clientId: string;
    requestId: string;
    timestamp: string;
    target: string;
    digest?: string;
  },
  secretKey: string
): Promise<string> {
  const lines = [
    `Client-Id:${c.clientId}`,
    `Request-Id:${c.requestId}`,
    `Request-Timestamp:${c.timestamp}`,
    `Request-Target:${c.target}`,
  ];
  if (c.digest !== undefined) lines.push(`Digest:${c.digest}`);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(lines.join("\n"))
  );
  return `HMACSHA256=${toBase64(mac)}`;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** UTC ISO-8601 without milliseconds, as DOKU expects. */
function dokuTimestamp(now = new Date()): string {
  return now.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * DOKU Checkout (non-SNAP). Payment methods shown are the ones enabled for
 * the merchant in the DOKU Back Office. Notifications are trusted only when
 * the HMAC signature and body digest match; the status is then re-read from
 * DOKU and that answer wins when final.
 */
export class DokuProvider implements PaymentProvider {
  readonly name = "doku";

  constructor(
    private readonly config: {
      clientId: string;
      secretKey: string;
      production: boolean;
      fetch?: typeof fetch;
    }
  ) {}

  private get http() {
    return this.config.fetch ?? ((input, init) => fetch(input, init));
  }

  private get api() {
    return this.config.production
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";
  }

  private async signedHeaders(target: string, body?: string) {
    const requestId = crypto.randomUUID();
    const timestamp = dokuTimestamp();
    const digest = body === undefined ? undefined : await dokuDigest(body);
    const signature = await dokuSignature(
      {
        clientId: this.config.clientId,
        requestId,
        timestamp,
        target,
        digest,
      },
      this.config.secretKey
    );
    return {
      "Client-Id": this.config.clientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      Signature: signature,
      Accept: "application/json",
    };
  }

  async createCheckout(r: CheckoutRequest): Promise<{ redirectUrl: string }> {
    const body = JSON.stringify({
      order: {
        amount: r.amountIdr,
        invoice_number: r.orderId,
        currency: "IDR",
        callback_url: r.finishUrl,
        line_items: [
          {
            name: dokuText(r.itemName),
            price: r.amountIdr,
            quantity: 1,
          },
        ],
      },
      payment: { payment_due_date: 24 * 60 },
      customer: {
        name: dokuText(r.customer.name),
        email: r.customer.email,
      },
    });
    const res = await this.http(`${this.api}${CHECKOUT_PATH}`, {
      method: "POST",
      headers: {
        ...(await this.signedHeaders(CHECKOUT_PATH, body)),
        "Content-Type": "application/json",
      },
      body,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`DOKU checkout failed: ${res.status} ${detail}`);
    }
    const data = (await res.json()) as {
      response?: { payment?: { url?: string } };
    };
    const url = data.response?.payment?.url;
    if (!url) throw new Error("DOKU checkout: no payment url returned");
    return { redirectUrl: url };
  }

  async verifyNotification(
    body: unknown,
    request?: NotificationRequest
  ): Promise<VerifiedNotification | null> {
    if (!request) return null;
    const h = request.headers;
    const clientId = h.get("Client-Id");
    const requestId = h.get("Request-Id");
    const timestamp = h.get("Request-Timestamp");
    const signature = h.get("Signature");
    if (!clientId || !requestId || !timestamp || !signature) return null;
    if (clientId !== this.config.clientId) return null;

    const digest = await dokuDigest(request.rawBody);
    const expected = await dokuSignature(
      { clientId, requestId, timestamp, target: DOKU_NOTIFY_PATH, digest },
      this.config.secretKey
    );
    if (!safeEqual(expected, signature)) return null;

    const n = body as DokuStatusBody;
    const orderId = n?.order?.invoice_number;
    const amount = Number(n?.order?.amount);
    if (!orderId || !Number.isFinite(amount)) return null;

    let status = mapDokuStatus(n.transaction?.status);
    let method = n.channel?.id ?? n.service?.id ?? null;

    // Re-read from DOKU. Their status API can lag right after payment, so a
    // still-pending answer doesn't override a signed final notification.
    try {
      const s = await this.fetchStatus(orderId);
      if (s.kind === "found") {
        const invoice = s.body.order?.invoice_number;
        if (invoice && invoice !== orderId) return null;
        const reread = mapDokuStatus(s.body.transaction?.status);
        if (reread !== "pending") status = reread;
        method = s.body.channel?.id ?? s.body.service?.id ?? method;
      }
    } catch {
      // Keep signed notification status
    }

    return { orderId, status, method, amountIdr: Math.round(amount) };
  }

  async checkStatus(orderId: string): Promise<VerifiedNotification | null> {
    const s = await this.fetchStatus(orderId);
    if (s.kind !== "found") return null;
    if (s.body.order?.invoice_number !== orderId) return null;
    const amount = Number(s.body.order?.amount);
    if (!Number.isFinite(amount)) return null;
    return {
      orderId,
      status: mapDokuStatus(s.body.transaction?.status),
      method: s.body.channel?.id ?? s.body.service?.id ?? null,
      amountIdr: Math.round(amount),
    };
  }

  /**
   * Asks for the status of an order that can't exist: DOKU answers "not
   * found" when the keys are right, and an auth error when they aren't.
   */
  async probe(): Promise<ProbeResult> {
    try {
      const s = await this.fetchStatus(`PROBE-${crypto.randomUUID()}`);
      return s.kind === "error"
        ? { ok: false, detail: s.detail }
        : { ok: true };
    } catch (error) {
      return { ok: false, detail: String(error) };
    }
  }

  private async fetchStatus(
    orderId: string
  ): Promise<
    | { kind: "found"; body: DokuStatusBody }
    | { kind: "missing" }
    | { kind: "error"; detail: string }
  > {
    const target = `${STATUS_PATH}${encodeURIComponent(orderId)}`;
    const res = await this.http(`${this.api}${target}`, {
      headers: await this.signedHeaders(target),
    });
    if (res.ok)
      return { kind: "found", body: (await res.json()) as DokuStatusBody };
    const detail = await res.text().catch(() => "");
    if (res.status === 404 || /not.?found/i.test(detail))
      return { kind: "missing" };
    return { kind: "error", detail: `${res.status} ${detail}`.slice(0, 300) };
  }
}
