import { and, desc, eq, gt, ne } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import { session } from "../drizzle/auth-schema";

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export async function listUserSessions(
  db: AppDatabase,
  userId: string
): Promise<SessionInfo[]> {
  const now = new Date();
  const rows = await db
    .select({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    })
    .from(session)
    .where(and(eq(session.userId, userId), gt(session.expiresAt, now)))
    .orderBy(desc(session.createdAt));

  return rows;
}

export async function revokeSession(
  db: AppDatabase,
  input: { userId: string; sessionId: string }
): Promise<void> {
  await db
    .delete(session)
    .where(
      and(eq(session.id, input.sessionId), eq(session.userId, input.userId))
    );
}

export async function revokeOtherSessions(
  db: AppDatabase,
  input: { userId: string; currentSessionId: string }
): Promise<void> {
  await db
    .delete(session)
    .where(
      and(
        eq(session.userId, input.userId),
        ne(session.id, input.currentSessionId)
      )
    );
}
