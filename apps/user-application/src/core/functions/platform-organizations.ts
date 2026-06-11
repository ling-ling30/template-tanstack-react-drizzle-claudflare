import { getAuth } from "@repo/data-ops/auth/server";
import { getDb } from "@repo/data-ops/database/setup";
import { appError } from "@repo/data-ops/errors";
import {
  createOrganization,
  listOrganizations,
  updateOrganizationStatus,
} from "@repo/data-ops/queries/organizations";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { z } from "zod";

async function requirePlatformAdmin() {
  const session = await getAuth().api.getSession(getRequest());

  if (!session) {
    throw appError("AUTH_REQUIRED", "Please sign in first.");
  }

  const allowedEmails = env.PLATFORM_ADMIN_EMAILS.split(",").map((email) =>
    email.trim().toLowerCase(),
  );

  if (!allowedEmails.includes(session.user.email.toLowerCase())) {
    throw appError("FORBIDDEN", "Platform admin access required.");
  }

  return session.user;
}

const listOrganizationsSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
});

export const listPlatformOrganizationsFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => listOrganizationsSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    return listOrganizations(getDb(), data);
  });

const createOrganizationSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
});

export const createPlatformOrganizationFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrganizationSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requirePlatformAdmin();
    return createOrganization(getDb(), {
      id: crypto.randomUUID(),
      slug: data.slug,
      name: data.name,
      createdBy: user.id,
      now: new Date().toISOString(),
    });
  });

const updateOrganizationStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["active", "disabled"]),
});

export const updatePlatformOrganizationStatusFn = createServerFn({
  method: "POST",
})
  .inputValidator((data: unknown) => updateOrganizationStatusSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    return updateOrganizationStatus(getDb(), {
      id: data.id,
      status: data.status,
      now: new Date().toISOString(),
    });
  });
