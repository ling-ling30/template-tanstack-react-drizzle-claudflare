import { appError } from "@repo/data-ops/errors";
// Imported from start-client-core, not react-start: react-start -> hydrateStart ->
// start.ts -> this file is an import cycle, and react-start's `export *` hasn't run
// yet when we get here after HMR, so createMiddleware would be undefined.
import { createMiddleware } from "@tanstack/start-client-core";
import { getRequest } from "@tanstack/react-start/server";
import { logger } from "../logger/logger";
import { toPublicError } from "./public-error";
import { isSameOriginRequest } from "./same-origin";

/**
 * Global server-function middleware, registered in `src/start.ts`
 * (`createStart({ functionMiddleware })`) so it runs on EVERY server function.
 *
 * 1. CSRF: rejects state-changing calls whose Origin/Referer isn't this host.
 * 2. Errors: normalizes every failure to an `AppError` (see `public-error.ts`).
 *
 * Kept in its own module with only `createMiddleware`, as TanStack Start
 * recommends: modules that also define `createServerFn` are rewritten by
 * Start's compiler, so don't add server functions to this file.
 */
export const csrfAndErrorMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const request = getRequest();

  if (!isSameOriginRequest(request)) {
    logger.warn(
      `[Security] CSRF blocked: method=${request.method} origin=${request.headers.get("origin")} referer=${request.headers.get("referer")}`
    );
    throw appError("FORBIDDEN", "CSRF check failed.");
  }

  try {
    return await next();
  } catch (error: unknown) {
    throw toPublicError(error, request.url);
  }
});
