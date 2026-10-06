import { and, count, eq } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import { member } from "../drizzle/auth-schema";
import { getPlatformSettings } from "./platform-settings";

/** Organizations the user created and still owns (their `owner` memberships). */
export async function countOwnedOrganizations(
  db: AppDatabase,
  userId: string
): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.role, "owner")));
  return rows[0]?.value ?? 0;
}

/**
 * May this user self-serve create another organization?
 *
 * Follows the platform setting `allowMultipleOrganizations`: when it is off a
 * user may create one organization and no more. Organizations they were merely
 * invited to don't count, and a user who already owns several (created while
 * the setting was on) keeps them; they just can't add more.
 *
 * This is a product policy, not a security boundary, and it is a check before
 * Better Auth's insert: two simultaneous creates by the same user can both
 * pass it (see docs/decisions.md).
 */
export async function canUserCreateOrganization(
  db: AppDatabase,
  userId: string
): Promise<boolean> {
  const settings = await getPlatformSettings(db);
  if (settings.allowMultipleOrganizations) return true;
  return (await countOwnedOrganizations(db, userId)) === 0;
}
