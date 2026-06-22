import { createHmac } from "node:crypto";
import { getEnv } from "@/core/env";

/**
 * Service trust (main app -> AI service). Recommended: a short-lived,
 * main-app-signed JWT carrying { client_id, scope, exp }, verified by the AI
 * service (ai-service-api-contract.md §1, option A). Falls back to a static
 * shared key if AI_SERVICE_JWT_SECRET is unset.
 *
 * Minimal HS256 JWT to avoid an extra dep in the skeleton; swap for a vetted
 * JWT library before production.
 */
const b64url = (buf: Buffer | string) =>
  Buffer.from(buf)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

export type ServiceScope = "read" | "write";

export function buildAuthHeaders(
  clientId: string,
  scope: ServiceScope
): Record<string, string> {
  const env = getEnv();

  if (env.AI_SERVICE_JWT_SECRET) {
    const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const now = Math.floor(Date.now() / 1000);
    const payload = b64url(
      JSON.stringify({ client_id: clientId, scope, iat: now, exp: now + 300 })
    );
    const sig = b64url(
      createHmac("sha256", env.AI_SERVICE_JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest()
    );
    return { Authorization: `Bearer ${header}.${payload}.${sig}` };
  }

  if (env.AI_SERVICE_KEY) {
    return { "X-Service-Key": env.AI_SERVICE_KEY, "X-Client-Id": clientId };
  }

  throw new Error(
    "No AI service trust configured (set AI_SERVICE_JWT_SECRET or AI_SERVICE_KEY)"
  );
}
