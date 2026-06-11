import { describe, expect, it, vi } from "vitest";
import { createOrganization } from "./organizations";
import type { AppDatabase } from "@/database/setup";

/**
 * Example: testing a data-ops query with a mocked Drizzle db.
 * No real database needed — assert the query builds the right call.
 */
describe("createOrganization", () => {
  it("inserts an active organization and returns its id", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn().mockReturnValue({ values });
    const db = { insert } as unknown as AppDatabase;

    const result = await createOrganization(db, {
      id: "org_1",
      slug: "demo",
      name: "Demo Org",
      createdBy: "owner@example.com",
      now: "2026-01-01T00:00:00.000Z",
    });

    expect(insert).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "org_1",
        slug: "demo",
        name: "Demo Org",
        status: "active",
      }),
    );
    expect(result).toEqual({ id: "org_1" });
  });
});
