import { createServerFn } from "@tanstack/react-start";
import { getPlatformAdmin } from "@/core/auth/platform";
import { getOptionalAuthContext } from "@/core/auth/context";
import { getRequest } from "@tanstack/react-start/server";

/** UX/routing helper: is the caller a platform admin? (Server fns re-check.) */
export const checkPlatformAdminStatusFn = createServerFn({
  method: "GET",
}).handler(async () => (await getPlatformAdmin()) !== null);

/**
 * UX/routing helper for the login pages: if the caller already has a session,
 * returns what `resolvePostLoginPath` needs to pick their home; else null.
 */
export const getSignedInHomeInputFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const context = await getOptionalAuthContext();
  if (!context) return null;

  const isPlatformAdmin = (await getPlatformAdmin()) !== null;
  if (isPlatformAdmin) return { isPlatformAdmin, organizationSlugs: [] };

  const organizations = await context.auth.api.listOrganizations({
    headers: getRequest().headers,
  });
  return {
    isPlatformAdmin,
    organizationSlugs: organizations.map((organization) => organization.slug),
  };
});
