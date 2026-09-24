import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhoneInput } from "./phone-input";

describe("PhoneInput", () => {
  it("renders with default country US dial code", () => {
    render(<PhoneInput placeholder="Enter phone" />);
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter phone")).toBeInTheDocument();
  });

  it("renders with specified default country", () => {
    render(<PhoneInput defaultCountry="ID" />);
    expect(screen.getByText("+62")).toBeInTheDocument();
  });

  it("handles user typing and triggers onChange with formatted value and meta", () => {
    const handleChange = vi.fn();
    render(<PhoneInput defaultCountry="US" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "2025550123" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.stringContaining("555"),
      expect.objectContaining({
        dialCode: "+1",
        country: expect.objectContaining({ code: "US" }),
      })
    );
  });

  it("opens popover when country trigger button is clicked", () => {
    render(<PhoneInput />);
    const trigger = screen.getByRole("button", { name: /select country/i });
    fireEvent.click(trigger);

    expect(
      screen.getByPlaceholderText("Search country or dial code...")
    ).toBeInTheDocument();
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();
  });
});
