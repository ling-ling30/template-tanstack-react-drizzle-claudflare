import { MemoryStorageProvider } from "./memory-adapter";
import { R2StorageProvider } from "./r2-adapter";
import type { BlobStorageProvider } from "./types";

export * from "./types";
export { MemoryStorageProvider } from "./memory-adapter";
export { R2StorageProvider } from "./r2-adapter";

let globalMemoryStorage: MemoryStorageProvider | null = null;

/**
 * Resolves the active storage provider.
 * If a Cloudflare R2 bucket is bound to env (e.g. `env.STORAGE_BUCKET`), it wraps it.
 * Otherwise, in local development / testing, returns an in-memory provider.
 */
export function getStorage(env?: Record<string, unknown>): BlobStorageProvider {
  const bucket =
    (env?.STORAGE_BUCKET as any) ||
    (env?.R2_BUCKET as any) ||
    (env?.BUCKET as any);

  if (
    bucket &&
    typeof bucket.put === "function" &&
    typeof bucket.get === "function"
  ) {
    const publicUrl = env?.STORAGE_PUBLIC_URL as string | undefined;
    return new R2StorageProvider(bucket, publicUrl);
  }

  // Fallback to singleton memory storage for local dev / tests
  if (!globalMemoryStorage) {
    globalMemoryStorage = new MemoryStorageProvider();
  }
  return globalMemoryStorage;
}
