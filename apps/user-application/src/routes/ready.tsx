import { createFileRoute } from "@tanstack/react-router";
import { getRuntime } from "@/core/runtime";

/**
 * Readiness probe. Verifies the worker can reach its D1 database and R2 bucket.
 * Returns 503 if any dependency check fails.
 */
export const Route = createFileRoute("/ready")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const runtime = getRuntime();

          await runtime.dbBinding.prepare("SELECT 1").first();
          await runtime.proofBucket.list({ limit: 1 });

          return Response.json({
            ok: true,
            checks: { authConfig: true, d1: true, r2: true },
            status: "ready",
          });
        } catch (error) {
          console.error("Readiness check failed", error);
          return Response.json(
            { ok: false, status: "not_ready" },
            { status: 503 },
          );
        }
      },
    },
  },
});
