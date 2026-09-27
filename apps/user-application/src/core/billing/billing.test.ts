import { describe, expect, it } from "vitest";
import {
  getBillingProvider,
  getQuotaRemaining,
  hasFeature,
  isWithinQuota,
  MockBillingProvider,
  type BillingPlan,
} from "./index";

describe("Billing & Entitlements abstraction", () => {
  const freePlan: BillingPlan = {
    id: "free",
    name: "Free Tier",
    features: ["analytics_view"],
    quotas: {
      seats: 3,
      projects: 5,
    },
  };

  const proPlan: BillingPlan = {
    id: "pro",
    name: "Pro Tier",
    features: ["*"],
    quotas: {
      seats: 50,
      projects: -1, // Unlimited
    },
  };

  it("checks feature flags correctly", () => {
    expect(hasFeature(freePlan, "analytics_view")).toBe(true);
    expect(hasFeature(freePlan, "export_csv")).toBe(false);
    expect(hasFeature(proPlan, "export_csv")).toBe(true);
  });

  it("calculates quota limits accurately", () => {
    expect(isWithinQuota(freePlan, "seats", 2)).toBe(true);
    expect(isWithinQuota(freePlan, "seats", 3)).toBe(false);
    expect(isWithinQuota(proPlan, "projects", 9999)).toBe(true); // Unlimited
  });

  it("computes remaining quota", () => {
    expect(getQuotaRemaining(freePlan, "seats", 1)).toBe(2);
    expect(getQuotaRemaining(freePlan, "seats", 5)).toBe(0);
    expect(getQuotaRemaining(proPlan, "projects", 100)).toBe(
      Number.POSITIVE_INFINITY
    );
  });

  it("generates mock checkout and portal sessions", () => {
    return (async () => {
      const provider = getBillingProvider();
      expect(provider).toBeInstanceOf(MockBillingProvider);

      const session = await provider.createCheckoutSession({
        planId: "pro",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      expect(session.url).toContain("mock_session");
      expect(session.sessionId).toBeDefined();

      const portal = await provider.createCustomerPortalSession(
        "cust_123",
        "https://example.com/dashboard"
      );
      expect(portal.url).toContain("portal=mock");
    })();
  });
});
