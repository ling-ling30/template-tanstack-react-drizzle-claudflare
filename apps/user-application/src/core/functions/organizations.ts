import { getDb } from "@repo/data-ops/database/setup";
import { getOrganizationBySlug } from "@repo/data-ops/queries/organizations";
import { createServerFn } from "@tanstack/react-start";

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
  .inputValidator((slug: string) => slug)
  .handler(async ({ data }) => {
    return getOrganizationBySlug(getDb(), data);
  });
