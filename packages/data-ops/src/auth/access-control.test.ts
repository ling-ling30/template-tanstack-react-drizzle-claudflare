import { describe, expect, it } from "vitest";
import { roleCan } from "./access-control";

describe("roleCan", () => {
  it("lets an owner manage roles", () => {
    expect(roleCan("owner", "roles", "manage")).toBe(true);
  });

  it("lets an admin manage users but not roles", () => {
    expect(roleCan("admin", "users", "manage")).toBe(true);
    expect(roleCan("admin", "roles", "manage")).toBe(false);
  });

  it("denies a member management actions", () => {
    expect(roleCan("member", "users", "manage")).toBe(false);
    expect(roleCan("member", "items", "delete")).toBe(false);
    expect(roleCan("member", "items", "view")).toBe(true);
  });

  it("grants when any role in a comma-separated list grants", () => {
    expect(roleCan("member, admin", "users", "manage")).toBe(true);
  });

  it("denies unknown and empty roles", () => {
    expect(roleCan("superuser", "items", "view")).toBe(false);
    expect(roleCan("", "items", "view")).toBe(false);
  });
});
