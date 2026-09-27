import { describe, expect, it } from "vitest";
import { appError } from "@repo/data-ops/errors";
import {
  describeFieldErrors,
  fieldErrorMessage,
  fieldErrorsOf,
  fieldLabel,
} from "./field-errors";

describe("field-errors", () => {
  it("translates rule tokens accurately", () => {
    expect(fieldErrorMessage("too_small:5")).toContain("5");
    expect(fieldErrorMessage("required")).toBeTruthy();
    expect(fieldErrorMessage("invalid_format")).toBeTruthy();
  });

  it("extracts field errors from an AppError", () => {
    const error = appError("VALIDATION_FAILED", "Invalid", {
      name: "too_small:3",
      email: "required",
    });

    const res = fieldErrorsOf(error);
    expect(res).not.toBeNull();
    expect(res?.name).toContain("3");
    expect(res?.email).toBeTruthy();
  });

  it("returns null when no field errors exist", () => {
    const error = appError("INTERNAL", "Server error");
    expect(fieldErrorsOf(error)).toBeNull();
    expect(describeFieldErrors(error)).toBeNull();
  });

  it("labels fields and builds summary messages", () => {
    expect(fieldLabel("email")).toBe("Email");

    const error = appError("VALIDATION_FAILED", "Invalid", {
      email: "required",
    });
    const summary = describeFieldErrors(error);
    expect(summary).toContain("Email");
  });
});
