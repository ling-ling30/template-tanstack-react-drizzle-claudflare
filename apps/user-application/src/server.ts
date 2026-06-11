import handler from "@tanstack/react-start/server-entry";
import { initRuntime } from "./core/runtime";
import { applySecurityHeaders } from "./core/security/headers";

export default {
  async fetch(request: Request, env: Env) {
    // Validate env + build (or reuse) the db/auth runtime exactly once per isolate.
    // Server functions read db/auth via getRuntime()/getDb()/getAuth(), so we do
    // not need to thread them through the request context here.
    await initRuntime(env);

    const response = await handler.fetch(request);
    return applySecurityHeaders(response);
  },
} satisfies ExportedHandler<Env>;
