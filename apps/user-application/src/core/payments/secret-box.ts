/**
 * Encrypts payment gateway keys for storage in the `payment_config` table.
 * AES-256-GCM with a key derived from the PAYMENT_CONFIG_KEY Worker secret.
 * The column name is bound in as additional data, so a ciphertext copied
 * into another column (say, sandbox into production) fails to decrypt.
 *
 * Format: "v1.<iv base64>.<ciphertext base64>".
 */
const VERSION = "v1";

function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`payment-config:${secret}`)
  );
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function sealSecret(
  secret: string,
  field: string,
  plaintext: string
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(field) },
    await deriveKey(secret),
    new TextEncoder().encode(plaintext)
  );
  return `${VERSION}.${toBase64(iv)}.${toBase64(new Uint8Array(sealed))}`;
}

/** Null when the value is malformed, tampered with, or sealed with another key or field name. */
export async function openSecret(
  secret: string,
  field: string,
  sealed: string
): Promise<string | null> {
  const parts = sealed.split(".");
  const version = parts[0];
  const iv = parts[1];
  const data = parts[2];
  if (version !== VERSION || !iv || !data) return null;
  try {
    const plain = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: fromBase64(iv),
        additionalData: new TextEncoder().encode(field),
      },
      await deriveKey(secret),
      fromBase64(data)
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}
