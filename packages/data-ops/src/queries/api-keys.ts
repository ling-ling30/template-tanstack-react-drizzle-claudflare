import { and, desc, eq } from "drizzle-orm";
import type { AppDatabase } from "../database/setup";
import {
  apiKeys,
  type ApiKey,
  type NewApiKey,
} from "../drizzle/api-keys-schema";

export async function createApiKey(
  db: AppDatabase,
  input: Omit<NewApiKey, "id" | "createdAt" | "lastUsedAt">
): Promise<ApiKey> {
  const now = new Date().toISOString();
  const entry: NewApiKey = {
    ...input,
    id: `key_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
  };
  await db.insert(apiKeys).values(entry);
  return entry as ApiKey;
}

export async function listApiKeys(
  db: AppDatabase,
  organizationId: string
): Promise<ApiKey[]> {
  return db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.organizationId, organizationId))
    .orderBy(desc(apiKeys.createdAt));
}

export async function revokeApiKey(
  db: AppDatabase,
  id: string,
  organizationId: string
): Promise<boolean> {
  await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.organizationId, organizationId)));
  return true;
}

export async function findApiKeyByHash(
  db: AppDatabase,
  keyHash: string
): Promise<ApiKey | null> {
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);
  return key ?? null;
}

export async function recordApiKeyUsage(
  db: AppDatabase,
  id: string
): Promise<void> {
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(apiKeys.id, id));
}
