import { expect, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

// Extend Vitest's expect with jest-dom matchers (toBeInTheDocument, etc.).
expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock ResizeObserver for Radix UI components in JSDOM
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
