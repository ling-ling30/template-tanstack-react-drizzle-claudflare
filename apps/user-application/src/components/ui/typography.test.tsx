import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Typography,
  Heading,
  Text,
  Code,
  Kbd,
  TypographyComponents,
} from "./typography";

describe("Typography Component", () => {
  it("renders body paragraph by default", () => {
    render(<Typography>Standard body text</Typography>);
    const el = screen.getByText("Standard body text");
    expect(el.tagName).toBe("P");
    expect(el).toHaveAttribute("data-slot", "typography");
    expect(el).toHaveAttribute("data-variant", "body");
  });

  it("renders display and headings with appropriate tags and tracking", () => {
    const { rerender } = render(
      <Typography variant="display">Hero Title</Typography>
    );
    let el = screen.getByText("Hero Title");
    expect(el.tagName).toBe("H1");
    expect(el.className).toContain("tracking-[-0.035em]");

    rerender(<Typography variant="h2">Section Title</Typography>);
    el = screen.getByText("Section Title");
    expect(el.tagName).toBe("H2");
    expect(el.className).toContain("tracking-[-0.02em]");
  });

  it("supports polymorphic 'as' prop override", () => {
    render(
      <Typography as="span" variant="h1">
        Span Heading
      </Typography>
    );
    const el = screen.getByText("Span Heading");
    expect(el.tagName).toBe("SPAN");
    expect(el.className).toContain("text-3xl");
  });

  it("supports asChild with Radix Slot", () => {
    render(
      <Typography asChild variant="large">
        <a href="#test">Link text</a>
      </Typography>
    );
    const el = screen.getByRole("link", { name: "Link text" });
    expect(el.tagName).toBe("A");
    expect(el.className).toContain("text-base");
    expect(el).toHaveAttribute("href", "#test");
  });

  it("applies semantic color tokens and weights", () => {
    render(
      <Typography color="destructive" weight="bold">
        Error Message
      </Typography>
    );
    const el = screen.getByText("Error Message");
    expect(el.className).toContain("text-destructive");
    expect(el.className).toContain("font-bold");
  });

  it("supports tabular-nums, truncate, and line clamping", () => {
    render(
      <Typography tabular truncate clamp={2}>
        $1,240.00
      </Typography>
    );
    const el = screen.getByText("$1,240.00");
    expect(el.className).toContain("tabular-nums");
    expect(el.className).toContain("truncate");
    expect(el.className).toContain("line-clamp-2");
  });

  it("renders convenience Heading, Text, Code, and Kbd components", () => {
    render(
      <div>
        <Heading level={1}>Heading 1</Heading>
        <Text>Paragraph</Text>
        <Code>const x = 1;</Code>
        <Kbd>⌘K</Kbd>
      </div>
    );

    expect(screen.getByText("Heading 1").tagName).toBe("H1");
    expect(screen.getByText("Paragraph").tagName).toBe("P");
    expect(screen.getByText("const x = 1;").tagName).toBe("CODE");
    expect(screen.getByText("⌘K").tagName).toBe("KBD");
  });

  it("renders compound namespace components (TypographyComponents.Lead, etc.)", () => {
    render(
      <div>
        <TypographyComponents.Lead>Lead text</TypographyComponents.Lead>
        <TypographyComponents.Micro>SYS_OK</TypographyComponents.Micro>
      </div>
    );

    const lead = screen.getByText("Lead text");
    expect(lead.tagName).toBe("P");
    expect(lead.className).toContain("text-muted-foreground");

    const micro = screen.getByText("SYS_OK");
    expect(micro.tagName).toBe("SPAN");
    expect(micro.className).toContain("uppercase");
  });
});
