import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollArea, ScrollBar } from "./scroll-area";

describe("ScrollArea", () => {
  it("renders children inside scroll viewport", () => {
    render(
      <ScrollArea className="h-48 w-48">
        <div>Scrollable Content Item</div>
      </ScrollArea>
    );
    expect(screen.getByText("Scrollable Content Item")).toBeInTheDocument();
  });

  it("renders with custom className on root", () => {
    const { container } = render(
      <ScrollArea className="custom-test-class">
        <div>Content</div>
      </ScrollArea>
    );
    const root = container.querySelector("[data-slot='scroll-area']");
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("custom-test-class");
  });

  it("renders horizontal ScrollBar when specified", () => {
    const { container } = render(
      <ScrollArea type="always" className="w-48 whitespace-nowrap">
        <div className="w-[600px]">Wide Content</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
    const horizontalBar = container.querySelector(
      "[data-slot='scroll-area-scrollbar'][data-orientation='horizontal']"
    );
    expect(horizontalBar).toBeInTheDocument();
  });
});
