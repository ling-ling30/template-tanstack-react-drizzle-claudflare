import { MockBillingProvider } from "./mock-adapter";
import type { BillingProvider } from "./types";

export * from "./types";
export * from "./entitlements";
export { MockBillingProvider } from "./mock-adapter";

let globalMockBilling: MockBillingProvider | null = null;

/**
 * Resolves the active billing provider.
 * Returns the configured provider or falls back to MockBillingProvider in dev/test.
 */
export function getBillingProvider(
  _env?: Record<string, unknown>
): BillingProvider {
  // Can be extended with StripeBillingProvider or MidtransBillingProvider if keys are present
  if (!globalMockBilling) {
    globalMockBilling = new MockBillingProvider();
  }
  return globalMockBilling;
}
