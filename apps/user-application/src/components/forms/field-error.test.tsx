import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldError } from "./field-error";

describe("FieldError", () => {
  it("renders the message when provided", () => {
    render(<FieldError message="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("renders nothing when message is empty/null", () => {
    const { container } = render(<FieldError message={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
