// From start-client-core, not react-start, to dodge the react-start <-> start.ts
// import cycle (see csrf-and-error.ts).
import { createStart } from "@tanstack/start-client-core";
import { csrfAndErrorMiddleware } from "@/core/middleware/csrf-and-error";

/**
 * Global Start instance.
 *
 * `functionMiddleware` here runs on EVERY server function automatically — this is
 * how the CSRF + error pipeline is wired. New server functions are protected by
 * default with no extra code; never attach this middleware per function.
 *
 * TanStack Start auto-discovers this file at `src/start.ts`.
 */
export const startInstance = createStart(() => ({
  functionMiddleware: [csrfAndErrorMiddleware],
}));
