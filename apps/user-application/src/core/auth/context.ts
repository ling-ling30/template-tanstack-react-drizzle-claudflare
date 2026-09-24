import { getAuth } from "@repo/data-ops/auth/server";
import { getDb } from "@repo/data-ops/database/setup";
import { appError } from "@repo/data-ops/errors";
import {
  getMemberRole,
  getOrganizationBySlug,
} from "@repo/data-ops/queries/organizations";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Resolves the org from its slug and proves the caller may act inside it:
 * signed in, org exists and is active, and the caller is a MEMBER of it.
 * Returns the caller's org `role` for `requirePermission`.
 *
 * Non-members get ORG_NOT_FOUND (not FORBIDDEN) so slugs can't be probed.
 */
export async function requireOrganizationContext(organizationSlug: string) {
  const auth = getAuth();
  const request = getRequest();
  const session = await auth.api.getSession(request);

  if (!session) {
    throw appError("AUTH_REQUIRED", "Please sign in first.");
  }

  const db = getDb();
  const organization = await getOrganizationBySlug(db, organizationSlug);

  if (!organization || organization.status !== "active") {
    throw appError("ORG_NOT_FOUND", "Organization not found.");
  }

  const role = await getMemberRole(db, {
    organizationId: organization.id,
    userId: session.user.id,
  });

  if (!role) {
    throw appError("ORG_NOT_FOUND", "Organization not found.");
  }

  return {
    auth,
    db,
    organization,
    role,
    userEmail: session.user.email,
    userId: session.user.id,
  };
}
