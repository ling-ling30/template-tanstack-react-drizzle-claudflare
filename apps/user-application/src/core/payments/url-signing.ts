/**
 * HMAC-signed query strings for URLs this Worker serves itself.
 * The signature covers every param except `sig`, sorted,
 * so no param can be added, dropped, or tampered with.
 */

const encoder = new TextEncoder();
const keyCache = new Map<string, Promise<CryptoKey>>();

function hmacKey(secret: string): Promise<CryptoKey> {
  let key = keyCache.get(secret);
  if (!key) {
    key = crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    keyCache.set(secret, key);
  }
  return key;
}

function canonical(path: string, params: URLSearchParams): string {
  const entries = [...params.entries()]
    .filter(([k]) => k !== "sig")
    .sort(([a], [b]) => a.localeCompare(b));
  return `${path}?${entries.map(([k, v]) => `${k}=${v}`).join("&")}`;
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns `path?params&exp=…&sig=…`. `expiresAt` is epoch seconds. */
export async function signPath(
  secret: string,
  path: string,
  params: Record<string, string>,
  expiresAt: number
): Promise<string> {
  const search = new URLSearchParams(params);
  search.set("exp", String(expiresAt));
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(canonical(path, search))
  );
  search.set("sig", toHex(sig));
  return `${path}?${search.toString()}`;
}

/** Verifies a URL produced by `signPath` (signature and expiry). */
export async function verifySignedUrl(
  secret: string,
  url: URL,
  now = Date.now()
): Promise<boolean> {
  const sig = url.searchParams.get("sig");
  const exp = Number(url.searchParams.get("exp"));
  if (!sig || !Number.isFinite(exp) || exp * 1000 < now) return false;
  const matches = sig.match(/../g);
  if (!matches) return false;
  const bytes = matches.map((h) => parseInt(h, 16));
  if (bytes.some(Number.isNaN)) return false;
  return crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret),
    new Uint8Array(bytes),
    encoder.encode(canonical(url.pathname, url.searchParams))
  );
}
