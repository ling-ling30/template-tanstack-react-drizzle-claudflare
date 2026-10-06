import { describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "@/database/setup";
import {
  DEFAULT_PLATFORM_SETTINGS,
  getPlatformSettings,
  savePlatformSettings,
} from "./platform-settings";

describe("getPlatformSettings", () => {
  function mockDb(rows: unknown[]) {
    const limit = vi.fn().mockResolvedValue(rows);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });
    return { select } as unknown as AppDatabase;
  }

  it("returns the saved row", async () => {
    const row = { allowMultipleOrganizations: false, updatedAt: 1700 };
    await expect(getPlatformSettings(mockDb([row]))).resolves.toEqual(row);
  });

  it("falls back to the defaults (multiple allowed) when nothing is saved", async () => {
    const settings = await getPlatformSettings(mockDb([]));
    expect(settings).toEqual(DEFAULT_PLATFORM_SETTINGS);
    expect(settings.allowMultipleOrganizations).toBe(true);
  });
});

describe("savePlatformSettings", () => {
  it("upserts the single settings row", async () => {
    const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
    const insert = vi.fn().mockReturnValue({ values });
    const db = { insert } as unknown as AppDatabase;

    await savePlatformSettings(db, {
      allowMultipleOrganizations: false,
      updatedBy: "admin_1",
      now: 1700,
    });

    const set = {
      allowMultipleOrganizations: false,
      updatedAt: 1700,
      updatedBy: "admin_1",
    };
    expect(values).toHaveBeenCalledWith({ id: "default", ...set });
    expect(onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ set })
    );
  });
});
