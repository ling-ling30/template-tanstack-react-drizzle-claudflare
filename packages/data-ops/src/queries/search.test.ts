import { describe, expect, it } from "vitest";
import { toContainsPattern } from "./search";

describe("toContainsPattern", () => {
  it("wraps the term in wildcards", () => {
    expect(toContainsPattern("alice")).toBe("%alice%");
  });

  it("escapes LIKE wildcards and the escape char", () => {
    expect(toContainsPattern("50%_off\\")).toBe("%50\\%\\_off\\\\%");
  });
});
