import { createFileRoute } from "@tanstack/react-router";
import { handleGatewayNotification } from "@/core/payments/sync";
import { getRuntime } from "@/core/runtime";

/**
 * DOKU HTTP webhook notification.
 * Public by necessity; verified via HMAC header signature and body digest.
 */
export const Route = createFileRoute("/api/payments/doku")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const runtime = getRuntime();
        const rawBody = await request.text();
        let body: unknown;
        try {
          body = JSON.parse(rawBody);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const status = await handleGatewayNotification(
          { db: runtime.db, env: runtime.env, now: Date.now() },
          "doku",
          body,
          { rawBody, headers: request.headers }
        );
        return status === 200
          ? Response.json({ ok: true })
          : new Response(null, { status });
      },
    },
  },
});
