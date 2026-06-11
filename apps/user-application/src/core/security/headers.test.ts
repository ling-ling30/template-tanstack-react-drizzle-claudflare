import { describe, expect, it } from "vitest";
import { applySecurityHeaders } from "./headers";

describe("applySecurityHeaders", () => {
  it("sets the core security headers", () => {
    const res = applySecurityHeaders(new Response("ok", { status: 200 }));
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(res.headers.get("Strict-Transport-Security")).toContain("max-age=");
    // CSP is applied in production only (skipped when import.meta.env.DEV),
    // so it is intentionally absent under the test runner.
  });

  it("preserves status and body", async () => {
    const res = applySecurityHeaders(
      new Response("hello", { status: 201, statusText: "Created" }),
    );
    expect(res.status).toBe(201);
    expect(await res.text()).toBe("hello");
  });
});
