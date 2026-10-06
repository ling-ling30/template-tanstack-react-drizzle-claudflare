import { getDb } from "@repo/data-ops/database/setup";
import { getOrganizationBySlug } from "@repo/data-ops/queries/organizations";
import { canUserCreateOrganization } from "@repo/data-ops/queries/organization-policy";
import { createServerFn } from "@tanstack/react-start";
import {
  requireAuthContext,
  requireOrganizationContext,
} from "@/core/auth/context";
import { z } from "zod";
import { zodInput } from "@/core/validation/zod-input";

const slugSchema = z.string().min(1).max(64);

/**
 * Public, UNAUTHENTICATED org lookup by slug.
 *
 * This is intentionally public: the login page needs basic org info (name/branding)
 * BEFORE a user has a session. It returns only non-sensitive org fields.
 *
 * Keep it that way deliberately — if you ever return sensitive data here, add an
 * auth check via `requireOrganizationContext`. Abuse (slug enumeration) is blunted
 * by the global CSRF/error middleware + you can add rate limiting at the edge.
 */
export const getOrganizationBySlugFn = createServerFn({ method: "GET" })
  .validator(zodInput(slugSchema))
  .handler(async ({ data }) => {
    return getOrganizationBySlug(getDb(), data);
  });

/**
 * Server-side gate for the `/$organizationSlug/dashboard` workspace: the caller must be
 * a member of an active org. Returns the org and the caller's role.
 */
export const getOrganizationWorkspaceFn = createServerFn({ method: "GET" })
  .validator(zodInput(slugSchema))
  .handler(async ({ data }) => {
    const { organization, role } = await requireOrganizationContext(data);
    return { organization, role };
  });

/**
 * Can the caller create another organization of their own? Drives the
 * /onboarding UI only: Better Auth enforces the same platform policy on every
 * create, so hiding the form is not the security boundary.
 */
export const getOrganizationCreationStatusFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const { user } = await requireAuthContext();
  return { canCreate: await canUserCreateOrganization(getDb(), user.id) };
});
