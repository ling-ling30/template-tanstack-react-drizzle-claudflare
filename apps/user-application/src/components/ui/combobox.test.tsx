import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Combobox, type ComboboxOption } from "./combobox";

const SAMPLE_OPTIONS: ComboboxOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "SolidJS", disabled: true },
];

describe("Combobox", () => {
  it("renders with placeholder", () => {
    render(
      <Combobox options={SAMPLE_OPTIONS} placeholder="Select framework..." />
    );
    expect(screen.getByText("Select framework...")).toBeInTheDocument();
  });

  it("renders with defaultValue", () => {
    render(
      <Combobox
        options={SAMPLE_OPTIONS}
        defaultValue="react"
        placeholder="Select framework..."
      />
    );
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("opens popover when trigger is clicked and displays options", () => {
    render(
      <Combobox options={SAMPLE_OPTIONS} placeholder="Select framework..." />
    );
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(
      screen.getByPlaceholderText("Search or type...")
    ).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.getByText("Svelte")).toBeInTheDocument();
  });

  it("filters options when search query is typed", () => {
    render(
      <Combobox options={SAMPLE_OPTIONS} placeholder="Select framework..." />
    );
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText("Search or type...");
    fireEvent.change(searchInput, { target: { value: "vue" } });

    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  it("selects an option and triggers onChange", () => {
    const handleChange = vi.fn();
    render(
      <Combobox
        options={SAMPLE_OPTIONS}
        onChange={handleChange}
        placeholder="Select framework..."
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const svelteBtn = screen.getByText("Svelte");
    fireEvent.click(svelteBtn);

    expect(handleChange).toHaveBeenCalledWith(
      "svelte",
      expect.objectContaining({ value: "svelte", label: "Svelte" })
    );
  });

  it("clears selection when clear button is clicked", () => {
    const handleChange = vi.fn();
    render(
      <Combobox
        options={SAMPLE_OPTIONS}
        defaultValue="react"
        onChange={handleChange}
        clearable
      />
    );

    const clearBtn = screen.getByRole("button", { name: /clear selection/i });
    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith("", undefined);
  });
});
