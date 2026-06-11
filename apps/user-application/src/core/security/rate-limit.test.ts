import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test-${Math.random()}`;
    const opts = { limit: 3, windowMs: 60_000 };
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    expect(checkRateLimit(key, opts).allowed).toBe(true);
    const blocked = checkRateLimit(key, opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("tracks remaining count", () => {
    const key = `test-${Math.random()}`;
    const opts = { limit: 2, windowMs: 60_000 };
    expect(checkRateLimit(key, opts).remaining).toBe(1);
    expect(checkRateLimit(key, opts).remaining).toBe(0);
  });
});
