import { createFileRoute } from "@tanstack/react-router";
import { handleGatewayNotification } from "@/core/payments/sync";
import { getRuntime } from "@/core/runtime";
import { safeRedirectPath } from "@/core/auth/safe-redirect";

/**
 * Offline dev checkout (PAYMENT_MODE=fake):
 * Settles the signed mock order and redirects back to the dashboard/finish URL.
 */
export const Route = createFileRoute("/api/payments/fake")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const runtime = getRuntime();
        const url = new URL(request.url);
        const status = await handleGatewayNotification(
          { db: runtime.db, env: runtime.env, now: Date.now() },
          "fake",
          url
        );
        if (status !== 200) return new Response(null, { status });
        const finish = new URL(
          url.searchParams.get("finish") ?? "/dashboard",
          runtime.env.BETTER_AUTH_URL
        );
        const target =
          safeRedirectPath(finish.pathname + finish.search) ?? "/dashboard";
        return Response.redirect(
          new URL(target, runtime.env.BETTER_AUTH_URL).toString(),
          302
        );
      },
    },
  },
});
