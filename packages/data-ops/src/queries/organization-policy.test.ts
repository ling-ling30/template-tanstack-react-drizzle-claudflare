import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "@/database/setup";

const getPlatformSettings = vi.fn();
vi.mock("./platform-settings", () => ({
  getPlatformSettings: (...args: unknown[]) => getPlatformSettings(...args),
}));

const { canUserCreateOrganization, countOwnedOrganizations } =
  await import("./organization-policy");

/** db whose owned-organization count query resolves to `rows`. */
function mockDb(rows: { value: number }[]) {
  const where = vi.fn().mockResolvedValue(rows);
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });
  return { db: { select } as unknown as AppDatabase, select };
}

describe("countOwnedOrganizations", () => {
  it("returns the owner-membership count", async () => {
    const { db } = mockDb([{ value: 3 }]);
    await expect(countOwnedOrganizations(db, "u_1")).resolves.toBe(3);
  });

  it("is 0 when the query returns no row", async () => {
    const { db } = mockDb([]);
    await expect(countOwnedOrganizations(db, "u_1")).resolves.toBe(0);
  });
});

describe("canUserCreateOrganization", () => {
  beforeEach(() => getPlatformSettings.mockReset());

  it("allows creating when multiple organizations are allowed, without counting", async () => {
    getPlatformSettings.mockResolvedValue({ allowMultipleOrganizations: true });
    const { db, select } = mockDb([{ value: 5 }]);

    await expect(canUserCreateOrganization(db, "u_1")).resolves.toBe(true);
    expect(select).not.toHaveBeenCalled();
  });

  it("allows a first organization when only one is allowed", async () => {
    getPlatformSettings.mockResolvedValue({
      allowMultipleOrganizations: false,
    });
    const { db } = mockDb([{ value: 0 }]);

    await expect(canUserCreateOrganization(db, "u_1")).resolves.toBe(true);
  });

  it.each([1, 2])(
    "blocks a user who owns %i organization(s) when only one is allowed",
    async (owned) => {
      getPlatformSettings.mockResolvedValue({
        allowMultipleOrganizations: false,
      });
      const { db } = mockDb([{ value: owned }]);

      await expect(canUserCreateOrganization(db, "u_1")).resolves.toBe(false);
    }
  );
});
