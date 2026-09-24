import { describe, expect, it } from "vitest";
import { isPlatformAdminEmail } from "./platform-admin-email";

describe("isPlatformAdminEmail", () => {
  const list = " owner@example.com , Ops@Example.com ";

  it("matches listed emails, ignoring case and spaces", () => {
    expect(isPlatformAdminEmail("owner@example.com", list)).toBe(true);
    expect(isPlatformAdminEmail("OPS@example.COM", list)).toBe(true);
  });

  it("rejects unlisted, empty, and partial matches", () => {
    expect(isPlatformAdminEmail("someone@example.com", list)).toBe(false);
    expect(isPlatformAdminEmail("", list)).toBe(false);
    expect(isPlatformAdminEmail("", "a@b.c,,")).toBe(false);
    expect(isPlatformAdminEmail("owner@example.co", list)).toBe(false);
  });
});
