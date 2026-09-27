// @vitest-environment node
import { describe, expect, it } from "vitest";
import { openSecret, sealSecret } from "./secret-box";

const KEY = "k".repeat(40);

describe("secret-box", () => {
  it("round-trips a key without storing it in clear", async () => {
    const sealed = await sealSecret(KEY, "dokuSandboxSecretKey", "SK-abc");
    expect(sealed).toMatch(/^v1\./);
    expect(sealed).not.toContain("SK-abc");
    expect(await openSecret(KEY, "dokuSandboxSecretKey", sealed)).toBe(
      "SK-abc"
    );
  });

  it("uses a fresh IV each time", async () => {
    const a = await sealSecret(KEY, "f", "same");
    const b = await sealSecret(KEY, "f", "same");
    expect(a).not.toBe(b);
  });

  it("refuses another column, another key, or a tampered value", async () => {
    const sealed = await sealSecret(KEY, "dokuSandboxSecretKey", "SK-abc");
    expect(await openSecret(KEY, "dokuProductionSecretKey", sealed)).toBeNull();
    expect(
      await openSecret("x".repeat(40), "dokuSandboxSecretKey", sealed)
    ).toBeNull();
    const parts = sealed.split(".");
    const v = parts[0];
    const iv = parts[1];
    const data = parts[2] ?? "";
    const flipped = `${v}.${iv}.${data.slice(0, -2)}${data.endsWith("AA") ? "BA" : "AA"}`;
    expect(await openSecret(KEY, "dokuSandboxSecretKey", flipped)).toBeNull();
    expect(await openSecret(KEY, "dokuSandboxSecretKey", "garbage")).toBeNull();
  });
});
