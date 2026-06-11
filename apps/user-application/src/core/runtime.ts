import { createAuth } from "@repo/data-ops/auth/server";
import { createDatabase } from "@repo/data-ops/database/setup";
import { setAuth } from "@repo/data-ops/auth/server";
import { initDatabase } from "@repo/data-ops/database/setup";
import { validateEnv, type ValidatedEnv } from "@/core/env";
import { sendEmail } from "@/core/email/mailer";
import { verificationEmail, resetPasswordEmail } from "@/core/email/templates";

/**
 * The fully-initialized server runtime: validated env plus the singletons
 * (db, auth) that server functions depend on. Built exactly once per worker
 * isolate and memoized, so we never rebuild the auth instance per request.
 */
type Runtime = {
  auth: ReturnType<typeof createAuth>;
  db: ReturnType<typeof createDatabase>;
  dbBinding: D1Database;
  proofBucket: R2Bucket;
  platformAdminEmails: string;
  env: ValidatedEnv;
};

let runtime: Runtime | undefined;
let runtimePromise: Promise<Runtime> | undefined;

async function createRuntime(bindings: Env): Promise<Runtime> {
  const env = validateEnv(bindings);
  const db = createDatabase(env.DB);
  const auth = createAuth({
    adapter: { drizzleDb: db, provider: "sqlite" },
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
  initDatabase(env.DB);
  setAuth({
    adapter: { drizzleDb: db, provider: "sqlite" },
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    sendEmail,
  });

  return {
    auth,
    db,
    dbBinding: env.DB,
    proofBucket: env.PROOF_BUCKET,
    platformAdminEmails: env.PLATFORM_ADMIN_EMAILS,
    env,
  };
}

/**
 * Initializes the runtime once and memoizes it. Safe to call on every request;
 * subsequent calls return the same promise/instance.
 */
export async function initRuntime(bindings: Env): Promise<Runtime> {
  if (!runtimePromise) {
    runtimePromise = createRuntime(bindings).then((value) => {
      runtime = value;
      return value;
    });
  }
  return runtimePromise;
}

/** Returns the initialized runtime, throwing if `initRuntime` has not run. */
export function getRuntime(): Runtime {
  if (!runtime) {
    throw new Error("Runtime not initialized. Did server.ts call initRuntime()?");
  }
  return runtime;
}
