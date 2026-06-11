import { describe, expect, it } from "vitest";
import { appError, isAppError } from "./errors";

describe("appError", () => {
  it("creates a structured error", () => {
    const error = appError("FORBIDDEN", "Tidak punya akses");

    expect(error).toEqual({
      code: "FORBIDDEN",
      message: "Tidak punya akses",
    });
    expect(isAppError(error)).toBe(true);
  });

  it("keeps field errors", () => {
    const error = appError("VALIDATION_FAILED", "Data tidak valid", {
      totalAmount: "Total wajib diisi",
    });

    expect(error.fieldErrors?.totalAmount).toBe("Total wajib diisi");
  });
});
