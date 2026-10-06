import { safeRedirectPath } from "./safe-redirect";

/** `/dashboard` and everything under it is the platform-admin area. */
function isPlatformAdminPath(path: string): boolean {
  const { pathname } = new URL(path, "https://same.invalid");
  const normalized = pathname.toLowerCase();
  return normalized === "/dashboard" || normalized.startsWith("/dashboard/");
}

/**
 * Where to send a user right after a successful sign-in.
 *
 * - A `redirect` target (where a route guard bounced them from) wins, except
 *   platform-admin paths for non-admins: that guard would only bounce them
 *   straight back to /login.
 * - Platform admins land on the platform dashboard.
 * - Everyone else lands on their organization's dashboard (`/{slug}/dashboard`)
 *   when they belong to exactly one, else on /onboarding to pick or create one.
 *
 * UX routing only: the destination routes re-check access on the server.
 */
export function resolvePostLoginPath({
  redirect,
  isPlatformAdmin,
  organizationSlugs,
}: {
  redirect: unknown;
  isPlatformAdmin: boolean;
  organizationSlugs: readonly string[];
}): string {
  const target = safeRedirectPath(redirect);
  if (target && (isPlatformAdmin || !isPlatformAdminPath(target))) {
    return target;
  }
  if (isPlatformAdmin) return "/dashboard";
  const [onlyOrganizationSlug] = organizationSlugs;
  if (organizationSlugs.length === 1 && onlyOrganizationSlug) {
    return `/${encodeURIComponent(onlyOrganizationSlug)}/dashboard`;
  }
  return "/onboarding";
}
