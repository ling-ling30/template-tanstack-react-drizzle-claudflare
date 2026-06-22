import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { getRuntime } from "@/core/runtime";

/**
 * Readiness probe. Verifies the server can reach MySQL and local object storage.
 * Returns 503 if any dependency check fails.
 */
export const Route = createFileRoute("/ready")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const runtime = getRuntime();

          await runtime.db.execute(sql`SELECT 1`);
          await runtime.storage.list({ limit: 1 });

          return Response.json({
            ok: true,
            checks: { authConfig: true, mysql: true, storage: true },
            status: "ready",
          });
        } catch (error) {
          console.error("Readiness check failed", error);
          return Response.json(
            { ok: false, status: "not_ready" },
            { status: 503 }
          );
        }
      },
    },
  },
});
