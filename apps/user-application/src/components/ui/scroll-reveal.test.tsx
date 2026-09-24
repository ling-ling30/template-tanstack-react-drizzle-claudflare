import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollReveal, ScrollRevealGroup } from "./scroll-reveal";

describe("ScrollReveal", () => {
  it("renders children correctly", () => {
    render(<ScrollReveal>Test Content</ScrollReveal>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders with custom polymorphic tag using 'as' prop", () => {
    const { container } = render(
      <ScrollReveal as="section">Section Content</ScrollReveal>
    );
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent("Section Content");
  });

  it("applies triggerImmediate properly without waiting for intersection", () => {
    render(
      <ScrollReveal triggerImmediate variant="fade-up">
        Immediate Content
      </ScrollReveal>
    );
    const el = screen.getByText("Immediate Content");
    expect(el).toHaveAttribute("data-visible", "true");
    expect(el).toHaveClass("opacity-100");
  });

  it("applies correct variant attribute", () => {
    render(
      <ScrollReveal variant="scale-up" triggerImmediate>
        Scale Content
      </ScrollReveal>
    );
    const el = screen.getByText("Scale Content");
    expect(el).toHaveAttribute("data-variant", "scale-up");
  });

  it("ScrollRevealGroup staggers delay across children", () => {
    const { container } = render(
      <ScrollRevealGroup staggerMs={80} baseDelayMs={50}>
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </ScrollRevealGroup>
    );

    const items = container.querySelectorAll("[data-slot='scroll-reveal']");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveStyle({ transitionDelay: "50ms" });
    expect(items[1]).toHaveStyle({ transitionDelay: "130ms" });
    expect(items[2]).toHaveStyle({ transitionDelay: "210ms" });
  });
});
