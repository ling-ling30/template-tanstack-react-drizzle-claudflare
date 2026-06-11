import { createFileRoute } from "@tanstack/react-router";

/**
 * Liveness probe. Returns 200 as long as the worker is serving requests.
 * Does not touch the database — use /ready for dependency checks.
 */
export const Route = createFileRoute("/health")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          ok: true,
          service: "saas-template",
          status: "live",
        }),
    },
  },
});
