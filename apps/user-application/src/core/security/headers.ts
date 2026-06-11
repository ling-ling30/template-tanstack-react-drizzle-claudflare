/**
 * Reusable security headers, applied to every response in `server.ts`.
 * Centralized so you tune your security posture in one place (and can unit-test it).
 */

/**
 * A conservative starter Content-Security-Policy.
 *
 * `'unsafe-inline'` is included for styles and scripts because SSR frameworks
 * (and the dev tooling) inject inline style/script tags. For a stricter policy,
 * move to nonce-based CSP once you've audited your inline usage, and remove
 * `'unsafe-inline'`. Adjust connect-src/img-src for your APIs and asset hosts.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  // CSP is only applied in production: the strict policy (notably connect-src/
  // script-src) blocks Vite's HMR websocket and dev client during `pnpm dev`.
  if (!import.meta.env?.DEV) {
    headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
