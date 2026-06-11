/**
 * Simple fixed-window rate limiter.
 *
 * DEFAULT: in-memory per-isolate counter. Good enough for basic abuse
 * protection and zero-config local dev, but each Worker isolate has its own
 * map — it is NOT a global limit. For accurate distributed limiting, back this
 * with Cloudflare KV or a Durable Object (see note below) and keep the same
 * `checkRateLimit` signature so call sites don't change.
 *
 * Usage (e.g. in a server function or the auth route):
 *   const { allowed, retryAfter } = checkRateLimit(clientKey, { limit: 10, windowMs: 60_000 });
 *   if (!allowed) throw new Response("Too Many Requests", { status: 429, headers: { "Retry-After": String(retryAfter) } });
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets (useful for a Retry-After header). */
  retryAfter: number;
};

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, retryAfter: 0 };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    retryAfter: 0,
  };
}

/** Derive a client key from a request (best-effort IP from CF headers). */
export function clientKeyFromRequest(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown"
  );
}
