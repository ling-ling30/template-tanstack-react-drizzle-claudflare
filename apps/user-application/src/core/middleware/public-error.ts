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
 *   - ZodError                      → VALIDATION_FAILED with per-field rule tokens
 *                                     ("too_small:N", "too_big:N", "required", etc.)
 *   - anything else                 → logged here, replaced by a bare INTERNAL error
 */
export function toPublicError(error: unknown, url: string): unknown {
  if (isControlFlow(error)) return error;
  if (isAppError(error)) return error;

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "_";
      fieldErrors[key] ??= issueToken(issue);
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

/**
 * A language-free description token of what a field got wrong.
 * The client then maps this to localized messages via core/field-errors.ts.
 */
export function issueToken(issue: ZodError["issues"][number]): string {
  switch (issue.code) {
    case "too_small":
      return `too_small:${Number(issue.minimum)}`;
    case "too_big":
      return `too_big:${Number(issue.maximum)}`;
    case "invalid_format":
      return "invalid_format";
    case "invalid_type":
      return issue.input === undefined ? "required" : "invalid";
    case "custom":
      return issue.message || "invalid";
    default:
      return "invalid";
  }
}

function isControlFlow(error: unknown): boolean {
  return error instanceof Response || isRedirect(error) || isNotFound(error);
}
