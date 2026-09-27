import { describe, expect, it } from "vitest";
import { generateApiKey, hashApiKey, verifyApiKey } from "./api-keys";

describe("API Key crypto utilities", () => {
  it("generates a valid API key with prefix and SHA-256 hash", async () => {
    const key = await generateApiKey("app_live");
    expect(key.secretKey).toMatch(/^app_live_[0-9a-f]{48}$/);
    expect(key.keyHash).toHaveLength(64);
    expect(key.prefix).toContain("app_live_");
  });

  it("produces deterministic SHA-256 hashes", async () => {
    const raw = "app_live_1234567890abcdef1234567890abcdef12345678";
    const hash1 = await hashApiKey(raw);
    const hash2 = await hashApiKey(raw);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("verifies matching keys and rejects invalid keys", async () => {
    const key = await generateApiKey();
    expect(await verifyApiKey(key.secretKey, key.keyHash)).toBe(true);
    expect(await verifyApiKey("app_live_wrong", key.keyHash)).toBe(false);
  });
});
