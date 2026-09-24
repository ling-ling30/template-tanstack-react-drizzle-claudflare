import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Format,
  FormattedBytes,
  FormattedCompactNumber,
  FormattedCurrency,
  FormattedDate,
  FormattedDateRange,
  FormattedDateTime,
  FormattedDuration,
  FormattedNumber,
  FormattedPercent,
  FormattedRelativeTime,
  FormattedTime,
} from "./formatted";

describe("Formatted UI Components", () => {
  describe("FormattedDate", () => {
    it("renders semantic <time> tag with ISO dateTime attribute and tabular figures", () => {
      const date = new Date("2026-09-24T12:00:00Z");
      render(<FormattedDate value={date} locale="en-US" />);
      const el = screen.getByText(/Sep 24, 2026/);
      expect(el.tagName).toBe("TIME");
      expect(el).toHaveAttribute("dateTime", date.toISOString());
      expect(el.className).toContain("tabular-nums");
    });

    it("renders fallback when value is null or invalid", () => {
      render(<FormattedDate value={null} fallback="—" />);
      expect(screen.getByText("—")).toBeDefined();
    });

    it("supports asChild with custom element", () => {
      render(
        <FormattedDate asChild value="2026-09-24T12:00:00Z" locale="en-US">
          <span data-testid="custom-date-slot" />
        </FormattedDate>
      );
      const el = screen.getByTestId("custom-date-slot");
      expect(el.tagName).toBe("SPAN");
      expect(el.textContent).toContain("Sep 24, 2026");
    });
  });

  describe("FormattedTime", () => {
    it("renders formatted time inside a semantic <time> element", () => {
      const d = new Date(2026, 8, 24, 15, 30, 0);
      render(<FormattedTime value={d} preset="12h" locale="en-US" />);
      const el = screen.getByText(/3:30\s*PM/);
      expect(el.tagName).toBe("TIME");
      expect(el.className).toContain("tabular-nums");
    });
  });

  describe("FormattedDateTime", () => {
    it("renders combined date and time with tabular numbers", () => {
      const d = new Date(2026, 8, 24, 15, 30, 0);
      render(<FormattedDateTime value={d} locale="en-US" />);
      const el = screen.getByText(/Sep 24, 2026.*3:30\s*PM/);
      expect(el.tagName).toBe("TIME");
      expect(el.className).toContain("tabular-nums");
    });
  });

  describe("FormattedRelativeTime", () => {
    it("renders relative time with title hover tooltip", () => {
      const now = new Date("2026-09-24T12:00:00Z");
      const past = new Date("2026-09-24T11:45:00Z");
      render(<FormattedRelativeTime value={past} now={now} locale="en-US" />);
      const el = screen.getByText(/15\s*min(utes)?\.?\s*ago/);
      expect(el.tagName).toBe("TIME");
      expect(el).toHaveAttribute("title");
    });
  });

  describe("FormattedDateRange", () => {
    it("renders date range with tabular styling", () => {
      const d1 = new Date(2026, 8, 20);
      const d2 = new Date(2026, 8, 25);
      render(<FormattedDateRange from={d1} to={d2} locale="en-US" />);
      const el = screen.getByText(/20/);
      expect(el.className).toContain("tabular-nums");
    });
  });

  describe("FormattedDuration", () => {
    it("renders duration", () => {
      render(<FormattedDuration value={125} unit="s" />);
      const el = screen.getByText("2m 5s");
      expect(el.className).toContain("tabular-nums");
    });
  });

  describe("FormattedNumber", () => {
    it("renders formatted number with thousands separators and tabular-nums", () => {
      render(<FormattedNumber value={1250000} locale="en-US" />);
      const el = screen.getByText("1,250,000");
      expect(el.tagName).toBe("SPAN");
      expect(el.className).toContain("tabular-nums");
    });
  });

  describe("FormattedCompactNumber", () => {
    it("renders compact representation", () => {
      render(
        <div>
          <FormattedCompactNumber value={14200} locale="en-US" />
          <FormattedCompactNumber value={14200} decimals={1} locale="en-US" />
        </div>
      );
      expect(screen.getByText("14K")).toBeDefined();
      expect(screen.getByText("14.2K")).toBeDefined();
    });
  });

  describe("FormattedCurrency", () => {
    it("renders currency correctly with symbol", () => {
      render(
        <FormattedCurrency value={1420.5} currency="USD" locale="en-US" />
      );
      const el = screen.getByText("$1,420.50");
      expect(el.tagName).toBe("SPAN");
      expect(el.className).toContain("tabular-nums");
    });
  });

  describe("FormattedPercent", () => {
    it("renders percentage with sign when requested", () => {
      render(
        <FormattedPercent value={0.125} showSign decimals={1} locale="en-US" />
      );
      const el = screen.getByText("+12.5%");
      expect(el.className).toContain("tabular-nums");
    });
  });

  describe("FormattedBytes", () => {
    it("renders file size bytes formatted", () => {
      render(<FormattedBytes value={1073741824 * 2.5} />);
      const el = screen.getByText("2.5 GB");
      expect(el.className).toContain("tabular-nums");
    });
  });

  describe("Format compound namespace", () => {
    it("exposes all subcomponents through Format.*", () => {
      render(
        <div>
          <Format.Number value={42} locale="en-US" />
          <Format.Currency value={99} currency="USD" locale="en-US" />
          <Format.Bytes value={1024} />
        </div>
      );
      expect(screen.getByText("42")).toBeDefined();
      expect(screen.getByText("$99.00")).toBeDefined();
      expect(screen.getByText("1 KB")).toBeDefined();
    });
  });
});
