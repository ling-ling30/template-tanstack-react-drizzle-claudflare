import handler from "@tanstack/react-start/server-entry";
import { initRuntime } from "./core/runtime";
import { applySecurityHeaders } from "./core/security/headers";

export default {
  async fetch(request: Request, env: Env) {
    try {
      // Validate env + build (or reuse) the db/auth runtime exactly once per isolate.
      // Server functions read db/auth via getRuntime()/getDb()/getAuth(), so we do
      // not need to thread them through the request context here.
      await initRuntime(env);

      const response = await handler.fetch(request);
      return applySecurityHeaders(response);
    } catch (err: unknown) {
      console.error("[Worker Runtime Exception]", err);
      const message = err instanceof Error ? err.message : String(err);
      return new Response(
        `Worker Runtime Error (500)\n\n${message}\n\nTip: Check Cloudflare Dashboard -> Workers & Pages -> Logs or run "npx wrangler tail" to inspect the trace.`,
        {
          status: 500,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        }
      );
    }
  },
} satisfies ExportedHandler<Env>;
