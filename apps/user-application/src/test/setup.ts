import { expect, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

// Extend Vitest's expect with jest-dom matchers (toBeInTheDocument, etc.).
expect.extend(matchers);

afterEach(() => {
  cleanup();
});
