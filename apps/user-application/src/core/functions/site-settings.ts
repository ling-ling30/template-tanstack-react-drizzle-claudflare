import { getAuth } from "@repo/data-ops/auth/server";
import { getDb } from "@repo/data-ops/database/setup";
import { appError } from "@repo/data-ops/errors";
import {
  getSiteSettings,
  upsertSiteSettings,
} from "@repo/data-ops/queries/site-settings";
import { siteSettingsInputSchema } from "@repo/data-ops/zod-schema/site-settings";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getEnv } from "@/core/env";

async function requirePlatformAdmin() {
  const session = await getAuth().api.getSession(getRequest());
  if (!session) {
    throw appError("AUTH_REQUIRED", "Authentication required.");
  }
  const allowed = getEnv()
    .PLATFORM_ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase());
  if (!allowed.includes(session.user.email.toLowerCase())) {
    throw appError("FORBIDDEN", "Platform admin access required.");
  }
  return session.user;
}

/**
 * Public read of site settings (Open Graph / SEO). Public because the landing
 * page and <head> injection need it before any session exists. Returns only
 * non-sensitive presentation fields.
 */
export const getSiteSettingsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getSiteSettings(getDb());
  }
);

/** Update site settings. Platform-admin only. */
export const updateSiteSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => siteSettingsInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    return upsertSiteSettings(getDb(), {
      ...data,
      now: new Date().toISOString(),
    });
  });
