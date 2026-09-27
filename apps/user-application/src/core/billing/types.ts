/**
 * Provider-agnostic Billing & Subscription abstraction.
 * Decouples SaaS tier management and checkout from Stripe, Midtrans, LemonSqueezy, etc.
 */

export type SubscriptionStatus =
  "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";

export type BillingPlan = {
  id: string;
  name: string;
  priceFormatted?: string;
  currency?: string;
  features: string[];
  quotas: Record<string, number>;
};

export type CheckoutSessionInput = {
  customerId?: string;
  customerEmail?: string;
  organizationId?: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type CheckoutSessionResult = {
  url: string;
  sessionId: string;
};

export type BillingWebhookEvent = {
  type:
    | "subscription.created"
    | "subscription.updated"
    | "subscription.deleted"
    | "invoice.paid"
    | "invoice.payment_failed";
  customerId: string;
  subscriptionId?: string;
  planId?: string;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
  metadata?: Record<string, string>;
};

export interface BillingProvider {
  /**
   * Creates a hosted checkout session or payment URL.
   */
  createCheckoutSession(
    input: CheckoutSessionInput
  ): Promise<CheckoutSessionResult>;

  /**
   * Generates a self-serve customer billing portal link.
   */
  createCustomerPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<{ url: string }>;

  /**
   * Parses and validates incoming payment gateway webhooks.
   */
  parseWebhook(
    request: Request,
    secret?: string
  ): Promise<BillingWebhookEvent | null>;
}
