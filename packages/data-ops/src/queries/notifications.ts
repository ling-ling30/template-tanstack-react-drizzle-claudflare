import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import {
  notifications,
  type NewNotification,
  type Notification,
} from "../drizzle/notifications-schema";

export async function createNotification(
  db: AppDatabase,
  input: Omit<NewNotification, "id" | "createdAt" | "readAt">
): Promise<Notification> {
  const entry: NewNotification = {
    ...input,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  await db.insert(notifications).values(entry);
  return entry as Notification;
}

export async function listUserNotifications(
  db: AppDatabase,
  userId: string,
  limit = 20
): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(
  db: AppDatabase,
  userId: string
): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return row?.count ?? 0;
}

export async function markNotificationAsRead(
  db: AppDatabase,
  id: string,
  userId: string
): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(
  db: AppDatabase,
  userId: string
): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
