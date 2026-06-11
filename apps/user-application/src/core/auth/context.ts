import { getAuth } from "@repo/data-ops/auth/server";
import { getDb } from "@repo/data-ops/database/setup";
import { appError } from "@repo/data-ops/errors";
import { getOrganizationBySlug } from "@repo/data-ops/queries/organizations";
import { getRequest } from "@tanstack/react-start/server";

export async function requireOrganizationContext(organizationSlug: string) {
  const auth = getAuth();
  const request = getRequest();
  const session = await auth.api.getSession(request);

  if (!session) {
    throw appError("AUTH_REQUIRED", "Please sign in first.");
  }

  const db = getDb();
  const organization = await getOrganizationBySlug(db, organizationSlug);

  if (!organization) {
    throw appError("ORG_NOT_FOUND", "Organization not found.");
  }

  return {
    auth,
    db,
    organization,
    userEmail: session.user.email,
    userId: session.user.id,
  };
}
