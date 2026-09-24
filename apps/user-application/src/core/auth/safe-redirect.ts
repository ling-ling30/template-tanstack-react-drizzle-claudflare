/**
 * Returns `value` only if it is a same-site path ("/dashboard?x=1"), else null.
 * Guards the `?redirect=` search param on /login against open redirects:
 * absolute URLs, protocol-relative "//evil.com", backslash tricks ("/\evil.com",
 * which browsers treat as "//"), and control characters are all rejected.
 */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  // Tabs/newlines are stripped by URL parsers and can smuggle "//".
  if (hasControlChars(value)) return null;

  try {
    // Resolving against a dummy origin must not change the origin.
    const url = new URL(value, "https://same.invalid");
    if (url.origin !== "https://same.invalid") return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}
