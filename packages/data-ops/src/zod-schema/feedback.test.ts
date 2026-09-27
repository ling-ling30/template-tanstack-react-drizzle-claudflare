import { describe, expect, it } from "vitest";
import { feedbackInputSchema } from "./feedback";

describe("feedbackInputSchema", () => {
  it("validates valid feedback input", () => {
    const valid = {
      title: "Navigation is unresponsive on mobile",
      description:
        "When viewing on iOS Safari, clicking the menu does nothing.",
      category: "bug",
      severity: "medium",
      pageUrl: "https://example.com/acme/app",
    };

    const parsed = feedbackInputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.category).toBe("bug");
      expect(parsed.data.severity).toBe("medium");
      expect(parsed.data.title).toBe(valid.title);
    }
  });

  it("rejects too short title or description", () => {
    const invalid = {
      title: "no",
      description: "bad",
      pageUrl: "https://example.com",
    };

    const parsed = feedbackInputSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("accepts valid category and severity overrides", () => {
    const feature = {
      title: "Add export to CSV for payments",
      description:
        "We need to export all monthly transactions into CSV format.",
      category: "feature",
      severity: "low",
      pageUrl: "https://example.com/acme/app/billing",
    };

    const parsed = feedbackInputSchema.safeParse(feature);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.category).toBe("feature");
      expect(parsed.data.severity).toBe("low");
    }
  });
});
