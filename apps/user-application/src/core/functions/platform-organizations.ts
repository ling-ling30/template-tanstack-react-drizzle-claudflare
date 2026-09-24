import { getDb } from "@repo/data-ops/database/setup";
import { appError } from "@repo/data-ops/errors";
import {
  getOrganizationDetail,
  listOrganizations,
  updateOrganizationStatus,
} from "@repo/data-ops/queries/organizations";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePlatformAdmin } from "@/core/auth/platform";
import { zodInput } from "@/core/validation/zod-input";

/**
 * Platform-admin oversight of organizations. Orgs are created self-serve by
 * their owners (`/onboarding`), so the platform lists them, inspects members,
 * and can disable/re-enable one. A disabled org fails `requireOrganizationContext`.
 */

const listSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  search: z.string().max(100).optional(),
});

export const listPlatformOrganizationsFn = createServerFn({ method: "GET" })
  .validator(zodInput(listSchema))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    return listOrganizations(getDb(), data);
  });

export const getPlatformOrganizationFn = createServerFn({ method: "GET" })
  .validator(zodInput(z.string().min(1)))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    const detail = await getOrganizationDetail(getDb(), data);
    if (!detail) throw appError("NOT_FOUND", "Organization not found.");
    return detail;
  });

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["active", "disabled"]),
});

export const updatePlatformOrganizationStatusFn = createServerFn({
  method: "POST",
})
  .validator(zodInput(updateStatusSchema))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    return updateOrganizationStatus(getDb(), data);
  });
