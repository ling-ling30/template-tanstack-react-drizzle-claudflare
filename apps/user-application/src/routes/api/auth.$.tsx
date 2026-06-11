import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@repo/data-ops/auth/server";
import {
  checkRateLimit,
  clientKeyFromRequest,
} from "@/core/security/rate-limit";

// Per-IP limit on auth mutations (login, signup, password reset) to blunt
// credential-stuffing / brute-force. GETs (session reads) are not limited.
// NOTE: the default limiter is per-isolate in-memory — swap to KV/Durable Object
// for a true global limit (see core/security/rate-limit.ts).
const AUTH_RATE_LIMIT = { limit: 20, windowMs: 60_000 };

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const auth = getAuth();
        return auth.handler(request);
      },
      POST: ({ request }) => {
        const key = `auth:${clientKeyFromRequest(request)}`;
        const result = checkRateLimit(key, AUTH_RATE_LIMIT);
        if (!result.allowed) {
          return new Response(
            JSON.stringify({ error: "Too many requests. Please try again later." }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(result.retryAfter),
              },
            },
          );
        }
        const auth = getAuth();
        return auth.handler(request);
      },
    },
  },
});
