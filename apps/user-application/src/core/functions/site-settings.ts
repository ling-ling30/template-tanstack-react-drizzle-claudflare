import { getDb } from "@repo/data-ops/database/setup";
import {
  getSiteSettings,
  upsertSiteSettings,
} from "@repo/data-ops/queries/site-settings";
import { siteSettingsInputSchema } from "@repo/data-ops/zod-schema/site-settings";
import { createServerFn } from "@tanstack/react-start";
import { requirePlatformAdmin } from "@/core/auth/platform";
import { zodInput } from "@/core/validation/zod-input";

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
  .inputValidator(zodInput(siteSettingsInputSchema))
  .handler(async ({ data }) => {
    await requirePlatformAdmin();
    return upsertSiteSettings(getDb(), {
      ...data,
      now: new Date().toISOString(),
    });
  });
