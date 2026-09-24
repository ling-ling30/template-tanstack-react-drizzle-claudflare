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

  it("immediately updates formatted value and calls onChange when country is selected in popover without typing", () => {
    const handleChange = vi.fn();
    render(
      <PhoneInput
        defaultCountry="US"
        defaultValue="81234567890"
        onChange={handleChange}
      />
    );

    // Open popover
    const trigger = screen.getByRole("button", { name: /select country/i });
    fireEvent.click(trigger);

    // Click Indonesia
    const indonesiaOption = screen.getByText("Indonesia");
    fireEvent.click(indonesiaOption);

    // Check that onChange was immediately invoked with the new Indonesian country and dial code
    expect(handleChange).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        dialCode: "+62",
        country: expect.objectContaining({ code: "ID" }),
        e164: expect.stringContaining("+62"),
      })
    );
  });

  it("immediately updates formatted value and calls onChange when country prop changes", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <PhoneInput country="US" value="2025550123" onChange={handleChange} />
    );

    handleChange.mockClear();

    // Change country prop to ID
    rerender(
      <PhoneInput country="ID" value="2025550123" onChange={handleChange} />
    );

    expect(handleChange).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        dialCode: "+62",
        country: expect.objectContaining({ code: "ID" }),
        e164: "+622025550123",
      })
    );
  });
});
