import { appError } from "@repo/data-ops/errors";
import { createServerFn } from "@tanstack/react-start";
import { requireOrganizationContext } from "@/core/auth/context";
import { requirePermission } from "@/core/auth/guards";
import { z } from "zod";
import { zodInput } from "@/core/validation/zod-input";

const createUserSchema = z.object({
  organizationSlug: z.string(),
  username: z.string().min(3),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["admin", "member"]).default("member"),
});

/**
 * Creates a username/password account and adds it to the caller's org.
 * For staff who sign in at `/$organizationSlug/login` without an email.
 * Gated on org membership + `users:manage`.
 */
export const createOrganizationUserFn = createServerFn({ method: "POST" })
  .inputValidator(zodInput(createUserSchema))
  .handler(async ({ data }) => {
    const context = await requireOrganizationContext(data.organizationSlug);
    requirePermission({
      role: context.role,
      resource: "users",
      action: "manage",
    });

    // Username-only accounts still need a unique email in Better Auth.
    const placeholderEmail = `${data.username}@${data.organizationSlug}.internal`;

    // Server-side API call: returns the new user without touching the caller's
    // session cookies (no `headers`, no `asResponse`).
    const created = await context.auth.api
      .signUpEmail({
        body: {
          email: placeholderEmail,
          password: data.password,
          name: data.name,
          username: data.username,
        },
      })
      .catch(() => {
        throw appError("CONFLICT", "That username is already taken.", {
          username: "taken",
        });
      });

    await context.auth.api.addMember({
      body: {
        userId: created.user.id,
        organizationId: context.organization.id,
        role: data.role,
      },
    });

    return { success: true, userId: created.user.id };
  });
