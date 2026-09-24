import { describe, expect, it } from "vitest";
import { requirePermission } from "./guards";

describe("requirePermission", () => {
  it("passes when the role grants the action", () => {
    expect(() =>
      requirePermission({ role: "owner", resource: "users", action: "manage" })
    ).not.toThrow();
  });

  it("throws a FORBIDDEN AppError when the role does not", () => {
    expect(() =>
      requirePermission({ role: "member", resource: "users", action: "manage" })
    ).toThrow(expect.objectContaining({ code: "FORBIDDEN" }));
  });
});
