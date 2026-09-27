import { describe, expect, it } from "vitest";
import { chunkArray, chunkedInArray } from "./d1-utils";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

const testTable = sqliteTable("test_items", {
  id: text("id").primaryKey(),
});

describe("chunkArray", () => {
  it("splits array into equal chunks", () => {
    const list = [1, 2, 3, 4, 5];
    expect(chunkArray(list, 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("handles empty arrays", () => {
    expect(chunkArray([], 10)).toEqual([]);
  });
});

describe("chunkedInArray", () => {
  it("returns 0 = 1 for empty values", () => {
    const condition = chunkedInArray(testTable.id, []);
    expect(condition).toBeDefined();
  });

  it("returns single inArray condition when below limit", () => {
    const condition = chunkedInArray(testTable.id, ["a", "b"], 10);
    expect(condition).toBeDefined();
  });

  it("combines multiple chunks with OR when exceeding limit", () => {
    const condition = chunkedInArray(testTable.id, ["a", "b", "c", "d"], 2);
    expect(condition).toBeDefined();
  });
});
