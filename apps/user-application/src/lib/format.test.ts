import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  formatTime,
  parseDate,
} from "./format";

describe("format utilities", () => {
  describe("parseDate", () => {
    it("handles null, undefined, and empty string", () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
      expect(parseDate("")).toBeNull();
    });

    it("handles invalid date strings", () => {
      expect(parseDate("invalid-date-string")).toBeNull();
    });

    it("parses valid Date instances, ISO strings, and timestamps", () => {
      const now = new Date();
      expect(parseDate(now)).toEqual(now);
      expect(parseDate("2026-09-24T12:00:00Z")).toBeInstanceOf(Date);
      expect(parseDate(1790268244101)).toBeInstanceOf(Date);
    });
  });

  describe("formatDate", () => {
    it("preserves backwards compatibility with legacy string locale argument", () => {
      const d = new Date("2026-09-24T12:00:00Z");
      const res = formatDate(d, "en-US");
      expect(res).toContain("Sep 24, 2026");

      // Invalid date with legacy string returns empty string
      expect(formatDate("invalid", "en-US")).toBe("");
    });

    it("formats with presets and options object", () => {
      const d = new Date("2026-09-24T12:00:00Z");
      expect(formatDate(d, { preset: "iso" })).toBe("2026-09-24");
      expect(formatDate(d, { preset: "medium", locale: "en-US" })).toContain(
        "Sep 24, 2026"
      );
      expect(formatDate(d, { preset: "weekday", locale: "en-US" })).toContain(
        "Thursday"
      );
      expect(formatDate(d, { preset: "month-year", locale: "en-US" })).toBe(
        "September 2026"
      );
    });

    it("returns fallback for null or invalid dates", () => {
      expect(formatDate(null)).toBe("—");
      expect(formatDate(undefined, { fallback: "N/A" })).toBe("N/A");
      expect(formatDate("bad-date")).toBe("—");
    });
  });

  describe("formatTime", () => {
    it("formats 12h and 24h times", () => {
      const d = new Date(2026, 8, 24, 15, 45, 0);
      const formatted12 = formatTime(d, { preset: "12h", locale: "en-US" });
      expect(formatted12).toMatch(/3:45\s*PM/);

      const formatted24 = formatTime(d, { preset: "24h", locale: "en-US" });
      expect(formatted24).toBe("15:45");
    });

    it("formats seconds when requested", () => {
      const d = new Date(2026, 8, 24, 15, 45, 30);
      const formatted = formatTime(d, { preset: "seconds", locale: "en-US" });
      expect(formatted).toMatch(/3:45:30\s*PM/);
    });

    it("handles fallback on null/empty", () => {
      expect(formatTime(null)).toBe("—");
    });
  });

  describe("formatDateTime", () => {
    it("combines date and time display", () => {
      const d = new Date(2026, 8, 24, 14, 30, 0);
      const res = formatDateTime(d, { locale: "en-US" });
      expect(res).toContain("Sep 24, 2026");
      expect(res).toMatch(/2:30\s*PM/);
    });

    it("handles fallback", () => {
      expect(formatDateTime(null)).toBe("—");
    });
  });

  describe("formatDateRange", () => {
    it("formats date ranges", () => {
      const d1 = new Date(2026, 8, 24);
      const d2 = new Date(2026, 8, 28);
      const res = formatDateRange(d1, d2, { locale: "en-US" });
      expect(res).toBeDefined();
      expect(res.length).toBeGreaterThan(0);
    });

    it("handles single date or nulls gracefully", () => {
      const d1 = new Date(2026, 8, 24);
      expect(formatDateRange(d1, null, { locale: "en-US" })).toContain(
        "Sep 24, 2026"
      );
      expect(formatDateRange(null, null)).toBe("—");
    });
  });

  describe("formatRelativeTime", () => {
    const baseNow = new Date("2026-09-24T12:00:00Z");

    it("returns 'just now' within 45 seconds", () => {
      const date = new Date("2026-09-24T12:00:20Z");
      expect(formatRelativeTime(date, { now: baseNow, locale: "en-US" })).toBe(
        "just now"
      );
    });

    it("formats minutes and hours ago", () => {
      const fiveMinAgo = new Date("2026-09-24T11:55:00Z");
      const resMin = formatRelativeTime(fiveMinAgo, {
        now: baseNow,
        locale: "en-US",
      });
      expect(resMin).toMatch(/5\s*min(utes)?\.?\s*ago/);

      const twoHoursAgo = new Date("2026-09-24T10:00:00Z");
      const resHour = formatRelativeTime(twoHoursAgo, {
        now: baseNow,
        locale: "en-US",
      });
      expect(resHour).toMatch(/2\s*hr(s)?\.?\s*ago/);
    });

    it("returns fallback for invalid input", () => {
      expect(formatRelativeTime(null)).toBe("—");
    });
  });

  describe("formatDuration", () => {
    it("formats seconds into readable duration", () => {
      expect(formatDuration(45, "s")).toBe("45s");
      expect(formatDuration(150, "s")).toBe("2m 30s");
      expect(formatDuration(3660, "s")).toBe("1h 1m");
      expect(formatDuration(86400 + 3600, "s")).toBe("1d 1h");
    });

    it("supports long style", () => {
      expect(formatDuration(3600, "s", { style: "long" })).toBe("1 hour");
      expect(formatDuration(150, "s", { style: "long" })).toBe(
        "2 minutes, 30 seconds"
      );
    });

    it("handles zero and fallback", () => {
      expect(formatDuration(0)).toBe("0s");
      expect(formatDuration(null)).toBe("—");
    });
  });

  describe("formatNumber", () => {
    it("formats standard numbers with separators", () => {
      expect(formatNumber(1250000, { locale: "en-US" })).toBe("1,250,000");
      expect(formatNumber("42500.5", { locale: "en-US", decimals: 2 })).toBe(
        "42,500.50"
      );
    });

    it("handles fallback", () => {
      expect(formatNumber(null)).toBe("—");
      expect(formatNumber("not-a-number")).toBe("—");
    });
  });

  describe("formatCompactNumber", () => {
    it("formats numbers compactly (K, M, B)", () => {
      expect(formatCompactNumber(1400, { locale: "en-US" })).toBe("1.4K");
      expect(formatCompactNumber(2500000, { locale: "en-US" })).toBe("2.5M");
    });

    it("handles fallback", () => {
      expect(formatCompactNumber(null)).toBe("—");
    });
  });

  describe("formatCurrency", () => {
    it("formats currency with string or options signature", () => {
      expect(formatCurrency(1420.5, "USD")).toBe("$1,420.50");
      expect(formatCurrency(1420.5, { currency: "USD", locale: "en-US" })).toBe(
        "$1,420.50"
      );
    });

    it("handles zero decimals when specified", () => {
      expect(
        formatCurrency(1420.5, {
          currency: "USD",
          locale: "en-US",
          decimals: 0,
        })
      ).toBe("$1,421");
    });

    it("handles fallback", () => {
      expect(formatCurrency(null)).toBe("—");
    });
  });

  describe("formatPercent", () => {
    it("formats fractional decimals by default", () => {
      expect(formatPercent(0.125, { locale: "en-US" })).toBe("12.5%");
      expect(formatPercent(0.94, { locale: "en-US", decimals: 0 })).toBe("94%");
    });

    it("formats whole number percent if isFractional is false", () => {
      expect(
        formatPercent(12.5, { isFractional: false, locale: "en-US" })
      ).toBe("12.5%");
    });

    it("supports signed display", () => {
      expect(
        formatPercent(0.08, { showSign: true, locale: "en-US", decimals: 0 })
      ).toBe("+8%");
    });

    it("handles fallback", () => {
      expect(formatPercent(null)).toBe("—");
    });
  });

  describe("formatBytes", () => {
    it("formats bytes to readable units", () => {
      expect(formatBytes(0)).toBe("0 B");
      expect(formatBytes(500)).toBe("500 B");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1536)).toBe("1.5 KB");
      expect(formatBytes(1048576 * 50)).toBe("50 MB");
      expect(formatBytes(1073741824 * 18.4)).toBe("18.4 GB");
    });

    it("supports binary units (KiB, MiB)", () => {
      expect(formatBytes(1024, { binaryUnits: true })).toBe("1 KiB");
      expect(formatBytes(1048576 * 2.5, { binaryUnits: true })).toBe("2.5 MiB");
    });

    it("handles fallback for negative or null", () => {
      expect(formatBytes(-100)).toBe("—");
      expect(formatBytes(null)).toBe("—");
    });
  });
});
