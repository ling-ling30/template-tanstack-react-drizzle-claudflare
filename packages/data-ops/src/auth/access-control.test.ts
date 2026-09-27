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

  it("enforces viewer role as read-only", () => {
    expect(roleCan("viewer", "items", "view")).toBe(true);
    expect(roleCan("viewer", "items", "create")).toBe(false);
    expect(roleCan("viewer", "items", "edit")).toBe(false);
    expect(roleCan("viewer", "billing", "view")).toBe(true);
    expect(roleCan("viewer", "billing", "manage")).toBe(false);
    expect(roleCan("viewer", "danger_zone", "delete")).toBe(false);
  });

  it("restricts danger zone delete to owner only", () => {
    expect(roleCan("owner", "danger_zone", "delete")).toBe(true);
    expect(roleCan("admin", "danger_zone", "delete")).toBe(false);
    expect(roleCan("member", "danger_zone", "delete")).toBe(false);
    expect(roleCan("viewer", "danger_zone", "delete")).toBe(false);
  });

  it("denies unknown and empty roles", () => {
    expect(roleCan("superuser", "items", "view")).toBe(false);
    expect(roleCan("", "items", "view")).toBe(false);
  });
});
