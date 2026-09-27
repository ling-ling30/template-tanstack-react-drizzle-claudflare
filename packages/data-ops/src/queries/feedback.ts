import { desc, eq } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import {
  feedback,
  type Feedback,
  type NewFeedback,
} from "../drizzle/feedback-schema";

export async function createFeedback(
  db: AppDatabase,
  input: Omit<NewFeedback, "id" | "createdAt" | "status"> & {
    status?: "open" | "in_progress" | "resolved";
  }
): Promise<Feedback> {
  const entry: NewFeedback = {
    ...input,
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: input.status ?? "open",
    createdAt: new Date().toISOString(),
  };
  await db.insert(feedback).values(entry);
  return entry as Feedback;
}

export async function listFeedback(
  db: AppDatabase,
  limit = 50
): Promise<Feedback[]> {
  return db
    .select()
    .from(feedback)
    .orderBy(desc(feedback.createdAt))
    .limit(limit);
}

export async function getFeedbackById(
  db: AppDatabase,
  id: string
): Promise<Feedback | null> {
  const [row] = await db
    .select()
    .from(feedback)
    .where(eq(feedback.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateFeedbackStatus(
  db: AppDatabase,
  id: string,
  status: "open" | "in_progress" | "resolved"
): Promise<void> {
  await db.update(feedback).set({ status }).where(eq(feedback.id, id));
}
