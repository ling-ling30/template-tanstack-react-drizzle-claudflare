import { describe, expect, it, vi } from "vitest";
import { getMemberRole, updateOrganizationStatus } from "./organizations";
import type { AppDatabase } from "@/database/setup";

/**
 * Example: testing a data-ops query with a mocked Drizzle db.
 * No real database needed — assert the query builds the right call.
 */
describe("updateOrganizationStatus", () => {
  it("sets the status and returns the org id", async () => {
    const where = vi.fn().mockResolvedValue(undefined);
    const set = vi.fn().mockReturnValue({ where });
    const update = vi.fn().mockReturnValue({ set });
    const db = { update } as unknown as AppDatabase;

    const result = await updateOrganizationStatus(db, {
      id: "org_1",
      status: "disabled",
    });

    expect(update).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith({ status: "disabled" });
    expect(where).toHaveBeenCalledOnce();
    expect(result).toEqual({ id: "org_1" });
  });
});

describe("getMemberRole", () => {
  function mockDb(rows: { role: string }[]) {
    const limit = vi.fn().mockResolvedValue(rows);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });
    return { select } as unknown as AppDatabase;
  }

  it("returns the member's role", async () => {
    const db = mockDb([{ role: "admin" }]);
    await expect(
      getMemberRole(db, { organizationId: "org_1", userId: "u_1" })
    ).resolves.toBe("admin");
  });

  it("returns null for a non-member", async () => {
    const db = mockDb([]);
    await expect(
      getMemberRole(db, { organizationId: "org_1", userId: "u_1" })
    ).resolves.toBeNull();
  });
});
