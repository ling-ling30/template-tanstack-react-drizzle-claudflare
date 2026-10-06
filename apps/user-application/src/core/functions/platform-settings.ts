import { getDb } from "@repo/data-ops/database/setup";
import { recordAuditLog } from "@repo/data-ops/queries/audit-logs";
import {
  getPlatformSettings,
  savePlatformSettings,
} from "@repo/data-ops/queries/platform-settings";
import { organizationPolicyInputSchema } from "@repo/data-ops/zod-schema/platform-settings";
import { createServerFn } from "@tanstack/react-start";
import { requirePlatformAdmin } from "@/core/auth/platform";
import { zodInput } from "@/core/validation/zod-input";

/** Organization policy for the operator dashboard. Platform-admin only. */
export const getOrganizationPolicyFn = createServerFn({
  method: "GET",
}).handler(async () => {
  await requirePlatformAdmin();
  const { allowMultipleOrganizations, updatedAt } =
    await getPlatformSettings(getDb());
  return { allowMultipleOrganizations, updatedAt };
});

/**
 * Sets whether users may create several organizations. Platform-admin only.
 * Better Auth enforces it on every self-serve create (see `createAuth`); it
 * never removes organizations a user already owns.
 */
export const updateOrganizationPolicyFn = createServerFn({ method: "POST" })
  .validator(zodInput(organizationPolicyInputSchema))
  .handler(async ({ data }) => {
    const admin = await requirePlatformAdmin();
    const db = getDb();

    await savePlatformSettings(db, {
      allowMultipleOrganizations: data.allowMultipleOrganizations,
      updatedBy: admin.id,
      now: Date.now(),
    });

    await recordAuditLog(db, {
      actorId: admin.id,
      action: "platform_settings.update",
      resourceType: "platform_settings",
      resourceId: "default",
      metadata: JSON.stringify({
        allowMultipleOrganizations: data.allowMultipleOrganizations,
      }),
    });

    return { allowMultipleOrganizations: data.allowMultipleOrganizations };
  });
