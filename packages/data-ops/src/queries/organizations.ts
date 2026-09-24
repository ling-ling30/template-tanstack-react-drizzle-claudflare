import { and, count, desc, eq, or } from "drizzle-orm";
import type { AppDatabase } from "@/database/setup";
import { member, organization, user } from "@/drizzle/auth-schema";
import { contains } from "@/queries/search";

/**
 * Organizations are Better Auth's `organization` rows — the single source of
 * truth. Creation, membership changes and invitations go through Better Auth's
 * API (`auth.api.createOrganization`, `addMember`, ...); these queries cover
 * the reads and the platform-level `status` flag Better Auth doesn't manage.
 */

export type OrganizationStatus = "active" | "disabled";

export type OrganizationSummary = {
  id: string;
  slug: string;
  name: string;
  status: OrganizationStatus;
};

const summaryColumns = {
  id: organization.id,
  slug: organization.slug,
  name: organization.name,
  status: organization.status,
};

function toSummary(row: {
  id: string;
  slug: string;
  name: string;
  status: string;
}): OrganizationSummary {
  return { ...row, status: row.status === "disabled" ? "disabled" : "active" };
}

export async function getOrganizationBySlug(
  db: AppDatabase,
  slug: string
): Promise<OrganizationSummary | null> {
  const rows = await db
    .select(summaryColumns)
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);

  return rows[0] ? toSummary(rows[0]) : null;
}

/** The user's role in the org, or null when they are not a member. */
export async function getMemberRole(
  db: AppDatabase,
  input: { organizationId: string; userId: string }
): Promise<string | null> {
  const rows = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, input.organizationId),
        eq(member.userId, input.userId)
      )
    )
    .limit(1);

  return rows[0]?.role ?? null;
}

export type PlatformOrganizationRow = OrganizationSummary & {
  createdAt: Date;
  memberCount: number;
};

/** Platform-admin listing: newest first, optional name/slug search, member counts. */
export async function listOrganizations(
  db: AppDatabase,
  input: {
    pageIndex: number;
    pageSize: number;
    search?: string;
  }
): Promise<{ rows: PlatformOrganizationRow[]; totalRowCount: number }> {
  const term = input.search?.trim();
  const where = term
    ? or(contains(organization.name, term), contains(organization.slug, term))
    : undefined;

  const rows = await db
    .select({
      ...summaryColumns,
      createdAt: organization.createdAt,
      memberCount: count(member.id),
    })
    .from(organization)
    .leftJoin(member, eq(member.organizationId, organization.id))
    .where(where)
    .groupBy(organization.id)
    .orderBy(desc(organization.createdAt))
    .limit(input.pageSize)
    .offset(input.pageIndex * input.pageSize);

  const totalRows = await db
    .select({ total: count() })
    .from(organization)
    .where(where);

  return {
    rows: rows.map((row) => ({ ...row, ...toSummary(row) })),
    totalRowCount: totalRows[0]?.total ?? 0,
  };
}

export type OrganizationMemberRow = {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  username: string | null;
  role: string;
  joinedAt: Date;
};

/** One org with its members (owners first), for the platform detail page. */
export async function getOrganizationDetail(
  db: AppDatabase,
  organizationId: string
): Promise<
  | (OrganizationSummary & {
      createdAt: Date;
      members: OrganizationMemberRow[];
    })
  | null
> {
  const orgRows = await db
    .select({ ...summaryColumns, createdAt: organization.createdAt })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  const org = orgRows[0];
  if (!org) return null;

  const members = await db
    .select({
      memberId: member.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: member.role,
      joinedAt: member.createdAt,
    })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .where(eq(member.organizationId, organizationId))
    .orderBy(member.createdAt);

  const rank = (role: string) =>
    role.includes("owner") ? 0 : role.includes("admin") ? 1 : 2;
  members.sort((a, b) => rank(a.role) - rank(b.role));

  return { ...org, ...toSummary(org), members };
}

export async function updateOrganizationStatus(
  db: AppDatabase,
  input: {
    id: string;
    status: OrganizationStatus;
  }
) {
  await db
    .update(organization)
    .set({ status: input.status })
    .where(eq(organization.id, input.id));

  return { id: input.id };
}
