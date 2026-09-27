/**
 * `PaymentProvider` seam: DOKU Checkout, Midtrans Snap, or Offline Fake Provider.
 * Notifications are always re-verified with the provider before anything is trusted,
 * and pending orders can be re-checked with `checkStatus` if a notification is delayed.
 */
export type CheckoutRequest = {
  orderId: string;
  amountIdr: number;
  itemName: string;
  customer: { name: string; email: string };
  finishUrl: string;
};

export type ProviderStatus =
  "paid" | "pending" | "failed" | "expired" | "refunded";

export type VerifiedNotification = {
  orderId: string;
  status: ProviderStatus;
  method: string | null;
  amountIdr: number;
};

/** The raw webhook request, for providers that sign headers + body (e.g. DOKU). */
export type NotificationRequest = { rawBody: string; headers: Headers };

export interface PaymentProvider {
  readonly name: string;
  createCheckout(request: CheckoutRequest): Promise<{ redirectUrl: string }>;
  /** Verifies a webhook body; returns null when the signature or status check fails. */
  verifyNotification(
    body: unknown,
    request?: NotificationRequest
  ): Promise<VerifiedNotification | null>;
  /** Reads an order's status directly from the provider; null if unknown. */
  checkStatus(orderId: string): Promise<VerifiedNotification | null>;
  /** Checks that the credentials work against the provider API, without creating an order. */
  probe(): Promise<ProbeResult>;
}

export type ProbeResult = { ok: true } | { ok: false; detail: string };
