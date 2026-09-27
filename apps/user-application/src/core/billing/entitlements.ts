import type { BillingPlan } from "./types";

/**
 * Universal, domain-agnostic SaaS feature gate & quota checker.
 */
export function hasFeature(plan: BillingPlan, featureKey: string): boolean {
  return plan.features.includes(featureKey) || plan.features.includes("*");
}

export function isWithinQuota(
  plan: BillingPlan,
  quotaKey: string,
  currentUsage: number
): boolean {
  const limit = plan.quotas[quotaKey];
  // If no quota defined or -1, treat as unlimited
  if (limit === undefined || limit === -1) {
    return true;
  }
  return currentUsage < limit;
}

export function getQuotaRemaining(
  plan: BillingPlan,
  quotaKey: string,
  currentUsage: number
): number {
  const limit = plan.quotas[quotaKey];
  if (limit === undefined || limit === -1) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, limit - currentUsage);
}
