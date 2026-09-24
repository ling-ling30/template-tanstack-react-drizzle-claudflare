import { appError, isAppError, type AppError } from "@repo/data-ops/errors";
import { isNotFound, isRedirect } from "@tanstack/react-router";
import { ZodError } from "zod";
import { logger } from "../logger/logger";

/**
 * Maps any value thrown by a server function to what may safely leave the server.
 * TanStack Start serializes whatever is thrown (including an Error's `cause`
 * and stack) and sends it to the client, so only these may pass:
 *   - AppError                      → unchanged (its `code` is the public contract)
 *   - redirect / notFound / Response → unchanged (router control flow)
 *   - ZodError                      → VALIDATION_FAILED with per-field messages
 *   - anything else                 → logged here, replaced by a bare INTERNAL error
 */
export function toPublicError(error: unknown, url: string): unknown {
  if (isControlFlow(error)) return error;
  if (isAppError(error)) return error;

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "_";
      fieldErrors[key] ??= issue.message;
    }
    return appError(
      "VALIDATION_FAILED",
      "Some fields are invalid.",
      fieldErrors
    ) satisfies AppError;
  }

  logger.error("Pipeline Error", error, { url });
  return appError("INTERNAL", "Internal Server Error");
}

function isControlFlow(error: unknown): boolean {
  return error instanceof Response || isRedirect(error) || isNotFound(error);
}
