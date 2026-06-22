import handler from "@tanstack/react-start/server-entry";
import { initRuntime } from "./core/runtime";
import { applySecurityHeaders } from "./core/security/headers";

/**
 * Node server entry (was a Cloudflare Worker `fetch` handler). Validate env +
 * build (or reuse) the db/auth/storage runtime once per process. Server
 * functions read db/auth via getRuntime()/getDb()/getAuth(), so we don't thread
 * them through the request context here.
 */
export default {
  async fetch(request: Request) {
    await initRuntime();
    const response = await handler.fetch(request);
    return applySecurityHeaders(response);
  },
};
