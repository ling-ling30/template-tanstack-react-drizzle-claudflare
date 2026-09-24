import { count, eq } from "drizzle-orm";
import type { AppDatabase } from "@/database/setup";
import { organization, user } from "@/drizzle/auth-schema";

export type PlatformStats = {
  users: number;
  organizations: number;
  activeOrganizations: number;
};

/** Headline numbers for the platform dashboard. */
export async function getPlatformStats(
  db: AppDatabase
): Promise<PlatformStats> {
  const [users, orgs, activeOrgs] = await Promise.all([
    db.select({ n: count() }).from(user),
    db.select({ n: count() }).from(organization),
    db
      .select({ n: count() })
      .from(organization)
      .where(eq(organization.status, "active")),
  ]);

  return {
    users: users[0]?.n ?? 0,
    organizations: orgs[0]?.n ?? 0,
    activeOrganizations: activeOrgs[0]?.n ?? 0,
  };
}
