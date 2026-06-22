import { createAuth } from "@repo/data-ops/auth/server";
import { createDatabase } from "@repo/data-ops/database/setup";
import { setAuth } from "@repo/data-ops/auth/server";
import { initDatabase } from "@repo/data-ops/database/setup";
import { validateEnv, type ValidatedEnv } from "@/core/env";
import { sendEmail } from "@/core/email/mailer";
import { verificationEmail, resetPasswordEmail } from "@/core/email/templates";
import {
  createLocalStorage,
  type ObjectStorage,
} from "@/core/storage/local-storage";

/**
 * Fully-initialized server runtime: validated env plus the singletons (db, auth,
 * storage). Built once per process and memoized, so the auth instance and MySQL
 * pool are never rebuilt per request. (Was per Cloudflare isolate; now per Node
 * process.)
 */
type Runtime = {
  auth: ReturnType<typeof createAuth>;
  db: ReturnType<typeof createDatabase>;
  storage: ObjectStorage;
  platformAdminEmails: string;
  env: ValidatedEnv;
};

let runtime: Runtime | undefined;
let runtimePromise: Promise<Runtime> | undefined;

async function createRuntime(): Promise<Runtime> {
  const env = validateEnv();
  const db = createDatabase(env.DATABASE_URL);
  const storage = createLocalStorage(env.STORAGE_DIR);
  const auth = createAuth({
    adapter: { drizzleDb: db, provider: "mysql" },
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    sendEmail,
    emailTemplates: {
      verification: verificationEmail,
      resetPassword: resetPasswordEmail,
    },
  });

  // Populate the backwards-compatible singletons so existing server functions
  // that call getDb()/getAuth() continue to work without changes.
  initDatabase(env.DATABASE_URL);
  setAuth({
    adapter: { drizzleDb: db, provider: "mysql" },
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    sendEmail,
  });

  return {
    auth,
    db,
    storage,
    platformAdminEmails: env.PLATFORM_ADMIN_EMAILS,
    env,
  };
}

/**
 * Initializes the runtime once and memoizes it. Safe to call on every request;
 * subsequent calls return the same promise/instance.
 */
export async function initRuntime(): Promise<Runtime> {
  if (!runtimePromise) {
    runtimePromise = createRuntime().then((value) => {
      runtime = value;
      return value;
    });
  }
  return runtimePromise;
}

/** Returns the initialized runtime, throwing if `initRuntime` has not run. */
export function getRuntime(): Runtime {
  if (!runtime) {
    throw new Error(
      "Runtime not initialized. Did the server entry call initRuntime()?"
    );
  }
  return runtime;
}
