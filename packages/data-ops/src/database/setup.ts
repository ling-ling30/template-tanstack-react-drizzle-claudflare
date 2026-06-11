import { drizzle } from "drizzle-orm/d1";
import * as appSchema from "@/drizzle/app-schema";
import * as authSchema from "@/drizzle/auth-schema";

const schema = {
  ...authSchema,
  ...appSchema,
};

export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Builds a Drizzle database client bound to the given D1 binding.
 *
 * Prefer this factory over the `initDatabase`/`getDb` singletons in new code;
 * it keeps no module-global state and is easy to use in tests.
 */
export function createDatabase(binding: D1Database): AppDatabase {
  return drizzle(binding, { schema });
}

let db: AppDatabase | undefined;

/** Backwards-compatible singleton setter. */
export function initDatabase(binding: D1Database) {
  db = createDatabase(binding);
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}
