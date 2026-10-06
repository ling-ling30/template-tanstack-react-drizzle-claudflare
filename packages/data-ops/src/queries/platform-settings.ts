import { eq } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import { platformSettings } from "../drizzle/platform-settings-schema";

const SETTINGS_ID = "default";

export type PlatformSettings = {
  allowMultipleOrganizations: boolean;
  /** Epoch ms of the last save; null while the defaults are in effect. */
  updatedAt: number | null;
};

/** What applies until an operator saves the settings once. */
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  allowMultipleOrganizations: true,
  updatedAt: null,
};

/** The single settings row, or the defaults when none has been saved. */
export async function getPlatformSettings(
  db: AppDatabase
): Promise<PlatformSettings> {
  const rows = await db
    .select({
      allowMultipleOrganizations: platformSettings.allowMultipleOrganizations,
      updatedAt: platformSettings.updatedAt,
    })
    .from(platformSettings)
    .where(eq(platformSettings.id, SETTINGS_ID))
    .limit(1);
  return rows[0] ?? DEFAULT_PLATFORM_SETTINGS;
}

/** Creates or updates the single settings row (idempotent upsert). */
export async function savePlatformSettings(
  db: AppDatabase,
  input: {
    allowMultipleOrganizations: boolean;
    updatedBy: string;
    now: number;
  }
): Promise<void> {
  const set = {
    allowMultipleOrganizations: input.allowMultipleOrganizations,
    updatedAt: input.now,
    updatedBy: input.updatedBy,
  };
  await db
    .insert(platformSettings)
    .values({ id: SETTINGS_ID, ...set })
    .onConflictDoUpdate({ target: platformSettings.id, set });
}
