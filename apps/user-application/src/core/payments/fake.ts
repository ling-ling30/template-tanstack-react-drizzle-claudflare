import { signPath, verifySignedUrl } from "./url-signing";
import type {
  CheckoutRequest,
  PaymentProvider,
  ProbeResult,
  VerifiedNotification,
} from "./provider";

export const FAKE_PAY_ROUTE = "/api/payments/fake";

/**
 * Offline dev provider (PAYMENT_MODE=fake). Checkout redirects to a signed
 * local URL that settles the order at once, so the whole pay flow runs under
 * `vite dev` without external gateway keys.
 */
export class FakePaymentProvider implements PaymentProvider {
  readonly name = "fake";

  constructor(private readonly config: { baseUrl: string; secret: string }) {}

  async createCheckout(r: CheckoutRequest): Promise<{ redirectUrl: string }> {
    const exp = Math.floor(Date.now() / 1000) + 24 * 3600;
    const path = await signPath(
      this.config.secret,
      FAKE_PAY_ROUTE,
      { order: r.orderId, amount: String(r.amountIdr), finish: r.finishUrl },
      exp
    );
    return { redirectUrl: `${this.config.baseUrl.replace(/\/$/, "")}${path}` };
  }

  async verifyNotification(
    body: unknown
  ): Promise<VerifiedNotification | null> {
    const url = body instanceof URL ? body : null;
    if (!url || !(await verifySignedUrl(this.config.secret, url))) return null;
    const orderId = url.searchParams.get("order");
    const amountStr = url.searchParams.get("amount");
    if (!orderId || !amountStr) return null;

    return {
      orderId,
      status: "paid",
      method: "fake",
      amountIdr: Number(amountStr),
    };
  }

  /** Fake orders settle immediately on the redirect itself. */
  async checkStatus(): Promise<VerifiedNotification | null> {
    return null;
  }

  async probe(): Promise<ProbeResult> {
    return { ok: true };
  }
}
