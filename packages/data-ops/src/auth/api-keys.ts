/**
 * Developer API Key generation and hashing utilities using Web Crypto API.
 * 100% Cloudflare Workers, Node 18+, and browser compatible.
 */

export type GeneratedApiKey = {
  secretKey: string; // Shown once to the user: "app_live_..."
  keyHash: string; // Stored in database (SHA-256 hex string)
  prefix: string; // Visible hint: "app_live_abc1..."
};

export async function hashApiKey(rawKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateApiKey(
  prefix = "app_live"
): Promise<GeneratedApiKey> {
  const randomBytes = new Uint8Array(24);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const secretKey = `${prefix}_${randomHex}`;
  const keyHash = await hashApiKey(secretKey);
  const displayPrefix = `${secretKey.slice(0, 12)}...`;

  return {
    secretKey,
    keyHash,
    prefix: displayPrefix,
  };
}

export async function verifyApiKey(
  rawKey: string,
  storedHash: string
): Promise<boolean> {
  const computedHash = await hashApiKey(rawKey);
  return computedHash === storedHash;
}
