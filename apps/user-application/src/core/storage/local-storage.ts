import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Filesystem-backed object storage — replaces Cloudflare R2 (PROOF_BUCKET).
 * Keys are treated as relative paths under STORAGE_DIR. A minimal R2-like surface
 * so the readiness probe and any upload code keep working with small changes.
 */
export type ObjectStorage = {
  put(key: string, data: Buffer | Uint8Array | string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  list(opts?: {
    prefix?: string;
    limit?: number;
  }): Promise<{ objects: { key: string }[] }>;
};

function safeJoin(baseDir: string, key: string): string {
  const target = path.resolve(baseDir, key);
  const base = path.resolve(baseDir);
  if (!target.startsWith(base + path.sep) && target !== base) {
    throw new Error(`Invalid storage key: ${key}`);
  }
  return target;
}

export function createLocalStorage(baseDir: string): ObjectStorage {
  return {
    async put(key, data) {
      const file = safeJoin(baseDir, key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, data);
    },
    async get(key) {
      try {
        return await fs.readFile(safeJoin(baseDir, key));
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw err;
      }
    },
    async delete(key) {
      try {
        await fs.unlink(safeJoin(baseDir, key));
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      }
    },
    async list(opts) {
      const base = path.resolve(baseDir);
      await fs.mkdir(base, { recursive: true });
      const out: { key: string }[] = [];
      const limit = opts?.limit ?? Infinity;
      const prefix = opts?.prefix ?? "";

      async function walk(dir: string): Promise<void> {
        if (out.length >= limit) return;
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (out.length >= limit) return;
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(full);
          } else {
            const key = path.relative(base, full).split(path.sep).join("/");
            if (key.startsWith(prefix)) out.push({ key });
          }
        }
      }

      await walk(base);
      return { objects: out.slice(0, opts?.limit ?? out.length) };
    },
  };
}
