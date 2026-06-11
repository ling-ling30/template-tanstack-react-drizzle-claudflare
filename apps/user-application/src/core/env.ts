import { z } from "zod";
import { logger } from "./logger/logger";

/**
 * Zod schema defining the expected environment variables for the Cloudflare Worker.
 * We validate this schema on server boot so that missing secrets crash the app loudly
 * rather than failing silently later in execution.
 */
export const envSchema = z.object({
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  PLATFORM_ADMIN_EMAILS: z.string().min(1, "PLATFORM_ADMIN_EMAILS is required"),
  // D1 and R2 bindings are objects injected by the Cloudflare runtime. Use
  // z.custom so the validated type stays D1Database / R2Bucket (z.any() erased it).
  DB: z.custom<D1Database>((db) => db !== undefined, "DB binding is required"),
  PROOF_BUCKET: z.custom<R2Bucket>(
    (bucket) => bucket !== undefined,
    "PROOF_BUCKET binding is required",
  ),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validates the raw Cloudflare Env object against the Zod schema.
 * Throws a detailed error if validation fails.
 */
export function validateEnv(env: unknown): ValidatedEnv {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    logger.fatal("Environment validation failed", result.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration. Check server logs.", {
      cause: result.error,
    });
  }
  return result.data;
}
