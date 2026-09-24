import { describe, expect, it } from "vitest";
import { safeRedirectPath, validateLoginSearch } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/dashboard/users?page=2", "/dashboard/users?page=2"],
    ["/alice-wed/app#top", "/alice-wed/app#top"],
  ])("keeps same-site path %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });

  it.each([
    ["absolute URL", "https://evil.com/phish"],
    ["protocol-relative", "//evil.com"],
    ["backslash trick", "/\\evil.com"],
    ["javascript scheme", "javascript:alert(1)"],
    ["relative path", "dashboard"],
    ["tab smuggling", "/\t/evil.com"],
    ["newline smuggling", "/\n/evil.com"],
    ["empty", ""],
  ])("rejects %s", (_label, input) => {
    expect(safeRedirectPath(input)).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(safeRedirectPath(undefined)).toBeNull();
    expect(safeRedirectPath(["/dashboard"])).toBeNull();
  });
});

describe("validateLoginSearch", () => {
  it("keeps a safe redirect", () => {
    expect(validateLoginSearch({ redirect: "/dashboard/users" })).toEqual({
      redirect: "/dashboard/users",
    });
  });

  it("returns the key as undefined for an unsafe value, so it overrides the raw URL param", () => {
    const raw = { redirect: "//evil.com" };
    const result = validateLoginSearch(raw);
    expect(result).toHaveProperty("redirect", undefined);
    // Simulates TanStack Router merging validated search over raw params:
    expect({ ...raw, ...result }.redirect).toBeUndefined();
  });
});
