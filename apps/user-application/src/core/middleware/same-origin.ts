/**
 * CSRF check for state-changing requests: the Origin (or, failing that, the
 * Referer) must be the same host as the request. Safe methods always pass.
 * A missing or unparsable Origin/Referer on a mutating request fails.
 */
export function isSameOriginRequest(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true;

  const host =
    request.headers.get("host") ||
    request.headers.get("x-forwarded-host") ||
    new URL(request.url).host;

  const source =
    request.headers.get("origin") ?? request.headers.get("referer");
  if (!source) return false;

  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}
