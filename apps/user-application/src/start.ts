import { createStart } from "@tanstack/react-start";
import { csrfAndErrorMiddleware } from "@/core/functions/base";

/**
 * Global Start instance.
 *
 * `functionMiddleware` here runs on EVERY server function automatically — this is
 * how the CSRF + error pipeline is actually wired. Previously the middleware was
 * only attached to an unused `baseServerFn`, so it never executed. Registering it
 * globally means new server functions are protected by default with no extra code.
 *
 * TanStack Start auto-discovers this file at `src/start.ts`.
 */
export const startInstance = createStart(() => ({
  functionMiddleware: [csrfAndErrorMiddleware],
}));
