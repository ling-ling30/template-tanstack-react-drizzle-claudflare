import { count, desc, eq, or } from "drizzle-orm";
import type { AppDatabase } from "@/database/setup";
import { member, user } from "@/drizzle/auth-schema";
import { contains } from "@/queries/search";

export type PlatformUserRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  createdAt: Date;
  organizationCount: number;
};

/** Platform-admin listing of every account: newest first, name/email/username search. */
export async function listUsers(
  db: AppDatabase,
  input: { pageIndex: number; pageSize: number; search?: string }
): Promise<{ rows: PlatformUserRow[]; totalRowCount: number }> {
  const term = input.search?.trim();
  const where = term
    ? or(
        contains(user.name, term),
        contains(user.email, term),
        contains(user.username, term)
      )
    : undefined;

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      organizationCount: count(member.id),
    })
    .from(user)
    .leftJoin(member, eq(member.userId, user.id))
    .where(where)
    .groupBy(user.id)
    .orderBy(desc(user.createdAt))
    .limit(input.pageSize)
    .offset(input.pageIndex * input.pageSize);

  const totalRows = await db.select({ total: count() }).from(user).where(where);

  return { rows, totalRowCount: totalRows[0]?.total ?? 0 };
}
