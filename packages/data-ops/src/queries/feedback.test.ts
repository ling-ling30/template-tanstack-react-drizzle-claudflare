import { describe, expect, it, vi } from "vitest";
import { createFeedback, listFeedback } from "./feedback";
import type { AppDatabase } from "../database/setup";

describe("feedback queries", () => {
  it("creates a feedback entry with generated id and timestamp", async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    const insert = vi.fn().mockReturnValue({ values });
    const db = { insert } as unknown as AppDatabase;

    const res = await createFeedback(db, {
      title: "Broken submit button",
      description: "Clicking submit on settings page throws error",
      pageUrl: "http://localhost:3030/acme/app/settings",
      category: "bug",
      severity: "high",
    });

    expect(insert).toHaveBeenCalledOnce();
    expect(res.id).toMatch(/^fb_/);
    expect(res.title).toBe("Broken submit button");
    expect(res.status).toBe("open");
    expect(res.createdAt).toBeDefined();
  });

  it("lists feedback entries ordered by created date", async () => {
    const mockList = [{ id: "fb_1", title: "Test Bug" }];
    const limit = vi.fn().mockResolvedValue(mockList);
    const orderBy = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ orderBy });
    const select = vi.fn().mockReturnValue({ from });
    const db = { select } as unknown as AppDatabase;

    const list = await listFeedback(db, 20);

    expect(select).toHaveBeenCalledOnce();
    expect(limit).toHaveBeenCalledWith(20);
    expect(list).toEqual(mockList);
  });
});
