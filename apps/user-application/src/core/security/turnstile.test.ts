import { describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "./turnstile";

describe("Cloudflare Turnstile verification", () => {
  it("bypasses verification in local development or with dummy keys", async () => {
    const res = await verifyTurnstileToken({
      token: "any-token",
      secretKey: "dummy-secret",
    });
    expect(res.success).toBe(true);
  });

  it("calls Cloudflare verification endpoint when secret is provided in production mode", async () => {
    const origEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = false;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        challenge_ts: "2026-09-27T00:00:00Z",
        hostname: "example.com",
      }),
    });
    global.fetch = mockFetch;

    try {
      const res = await verifyTurnstileToken({
        token: "real_token_123",
        secretKey: "0x4AAAAAA...",
        remoteIp: "127.0.0.1",
      });

      expect(res.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        expect.objectContaining({ method: "POST" })
      );
    } finally {
      (import.meta.env as any).DEV = origEnv;
    }
  });

  it("handles remote verification errors gracefully", async () => {
    const origEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = false;

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    try {
      const res = await verifyTurnstileToken({
        token: "bad_token",
        secretKey: "real_secret",
      });

      expect(res.success).toBe(false);
      expect(res.errorCodes).toContain("http_error_500");
    } finally {
      (import.meta.env as any).DEV = origEnv;
    }
  });
});
