import type {
  BillingProvider,
  BillingWebhookEvent,
  CheckoutSessionInput,
  CheckoutSessionResult,
} from "./types";

/**
 * Zero-config mock billing provider for local development, CI, and test environments.
 * Simulates checkout URLs and portal links without external API credentials.
 */
export class MockBillingProvider implements BillingProvider {
  async createCheckoutSession(
    input: CheckoutSessionInput
  ): Promise<CheckoutSessionResult> {
    const sessionId = `mock_session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const url = `${input.successUrl}${input.successUrl.includes("?") ? "&" : "?"}session_id=${sessionId}&mock=true`;
    return { url, sessionId };
  }

  async createCustomerPortalSession(
    _customerId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    return {
      url: `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}portal=mock`,
    };
  }

  async parseWebhook(
    request: Request,
    _secret?: string
  ): Promise<BillingWebhookEvent | null> {
    try {
      const body = (await request.json()) as any;
      if (!body || typeof body !== "object") return null;

      return {
        type: body.type ?? "invoice.paid",
        customerId: body.customerId ?? "mock_cust_123",
        subscriptionId: body.subscriptionId ?? "mock_sub_123",
        status: body.status ?? "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: body.metadata,
      };
    } catch {
      return null;
    }
  }
}
