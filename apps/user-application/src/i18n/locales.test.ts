import { describe, expect, it } from "vitest";
import en from "./locales/en/common.json";
import id from "./locales/id/common.json";

/** Recursively collect all dotted key paths from a nested object. */
function keyPaths(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === "object"
      ? keyPaths(v as Record<string, unknown>, path)
      : [path];
  });
}

describe("locale parity", () => {
  it("every English key exists in Indonesian (and vice versa)", () => {
    const enKeys = keyPaths(en).sort();
    const idKeys = keyPaths(id).sort();
    expect(idKeys).toEqual(enKeys);
  });
});
