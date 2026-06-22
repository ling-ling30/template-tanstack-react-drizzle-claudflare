import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/database/setup";
import { siteSettings } from "@/drizzle/app-schema";
import type {
  SiteSettings,
  SiteSettingsInput,
} from "@/zod-schema/site-settings";

const DEFAULT_ID = "default";

/** Sensible defaults used when no row exists yet. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: DEFAULT_ID,
  siteName: "Modern SaaS Template",
  ogTitle: "Modern SaaS Template",
  ogDescription: "A production-ready SaaS template.",
  ogImage: null,
  updatedAt: "1970-01-01T00:00:00.000Z",
};

/** Returns the single site-settings row, or sensible defaults if unset. */
export async function getSiteSettings(db: AppDatabase): Promise<SiteSettings> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, DEFAULT_ID))
    .limit(1);
  const row = rows[0];
  return row ? (row as SiteSettings) : DEFAULT_SITE_SETTINGS;
}

/** Inserts or updates the single site-settings row. */
export async function upsertSiteSettings(
  db: AppDatabase,
  input: SiteSettingsInput & { now: string }
): Promise<SiteSettings> {
  const values = {
    id: DEFAULT_ID,
    siteName: input.siteName,
    ogTitle: input.ogTitle,
    ogDescription: input.ogDescription,
    ogImage: input.ogImage,
    updatedAt: input.now,
  };
  // MySQL upsert (was sqlite/pg onConflictDoUpdate).
  await db
    .insert(siteSettings)
    .values(values)
    .onDuplicateKeyUpdate({ set: values });
  return values;
}
