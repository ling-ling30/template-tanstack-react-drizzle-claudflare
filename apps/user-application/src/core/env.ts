import { z } from "zod";
import { logger } from "./logger/logger";

/**
 * Expected environment for the Node server (was Cloudflare Worker bindings).
 * Validated on boot so missing secrets crash loudly. D1/R2 bindings are gone:
 * the DB is a MySQL connection string and object storage is a local directory.
 */
export const envSchema = z.object({
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  PLATFORM_ADMIN_EMAILS: z.string().min(1, "PLATFORM_ADMIN_EMAILS is required"),

  // MySQL connection string (replaces the D1 binding).
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // Local object storage root (replaces the R2 PROOF_BUCKET binding).
  STORAGE_DIR: z.string().default("./.storage"),

  // Email (Mailgun SMTP via Nodemailer).
  SMTP_HOST: z.string().default("smtp.mailgun.org"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default("Gositus <no-reply@gositus.ai>"),

  // AI service (backend-only, private). Prefer signed JWT; static key fallback.
  AI_SERVICE_URL: z.string().url("AI_SERVICE_URL must be a valid URL"),
  AI_SERVICE_JWT_SECRET: z.string().optional(),
  AI_SERVICE_KEY: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validates `process.env` against the schema. Throws a detailed error on failure.
 * Pass an explicit object in tests.
 */
export function validateEnv(env: unknown = process.env): ValidatedEnv {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    logger.fatal(
      "Environment validation failed",
      result.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment configuration. Check server logs.", {
      cause: result.error,
    });
  }
  return result.data;
}

let cachedEnv: ValidatedEnv | null = null;

/** Memoized validated env for code paths outside the runtime (e.g. mailer). */
export function getEnv(): ValidatedEnv {
  if (!cachedEnv) cachedEnv = validateEnv();
  return cachedEnv;
}
