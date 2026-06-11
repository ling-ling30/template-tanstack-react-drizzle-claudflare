import { count, eq } from "drizzle-orm";
import type { AppDatabase } from "@/database/setup";
import { organizations } from "@/drizzle/app-schema";

export type OrganizationSummary = {
  id: string;
  slug: string;
  name: string;
  status: "active" | "disabled";
};

export async function getOrganizationBySlug(
  db: AppDatabase,
  slug: string,
): Promise<OrganizationSummary | null> {
  const rows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function listOrganizations(
  db: AppDatabase,
  input: {
    pageIndex: number;
    pageSize: number;
  },
) {
  const rows = await db
    .select()
    .from(organizations)
    .limit(input.pageSize)
    .offset(input.pageIndex * input.pageSize);

  const totalRows = await db.select({ total: count() }).from(organizations);

  return {
    rows,
    totalRowCount: totalRows[0]?.total ?? 0,
  };
}

export async function createOrganization(
  db: AppDatabase,
  input: {
    id: string;
    slug: string;
    name: string;
    createdBy: string;
    now: string;
  },
) {
  await db.insert(organizations).values({
    id: input.id,
    slug: input.slug,
    name: input.name,
    status: "active",
    createdBy: input.createdBy,
    createdAt: input.now,
    updatedAt: input.now,
  });

  return { id: input.id };
}

export async function updateOrganizationStatus(
  db: AppDatabase,
  input: {
    id: string;
    status: "active" | "disabled";
    now: string;
  },
) {
  await db
    .update(organizations)
    .set({ status: input.status, updatedAt: input.now })
    .where(eq(organizations.id, input.id));

  return { id: input.id };
}
