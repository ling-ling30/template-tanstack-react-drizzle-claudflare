import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2";
import * as appSchema from "@/drizzle/app-schema";
import * as authSchema from "@/drizzle/auth-schema";

const schema = {
  ...authSchema,
  ...appSchema,
};

export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Builds a Drizzle database client backed by a MySQL pool (replaces Cloudflare D1).
 *
 * Prefer this factory over the `initDatabase`/`getDb` singletons in new code;
 * it keeps no module-global state and is easy to use in tests. Pass either a
 * connection-string URL or an existing mysql2 Pool.
 */
export function createDatabase(connection: string | Pool): AppDatabase {
  const pool =
    typeof connection === "string" ? createPool(connection) : connection;
  return drizzle(pool, { schema, mode: "default" });
}

let db: AppDatabase | undefined;

/** Backwards-compatible singleton setter. */
export function initDatabase(connection: string | Pool) {
  db = createDatabase(connection);
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}
