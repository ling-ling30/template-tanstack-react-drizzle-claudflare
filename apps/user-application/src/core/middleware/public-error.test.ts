import { notFound, redirect } from "@tanstack/react-router";
import { appError } from "@repo/data-ops/errors";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { toPublicError } from "./public-error";

vi.mock("../logger/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

describe("toPublicError", () => {
  it("passes AppErrors through unchanged", () => {
    const err = appError("FORBIDDEN", "nope");
    expect(toPublicError(err, "/x")).toBe(err);
  });

  it("maps ZodErrors to VALIDATION_FAILED with field errors", () => {
    const result = z
      .object({ name: z.string().min(3) })
      .safeParse({ name: "a" });
    const mapped = toPublicError(result.error, "/x");
    expect(mapped).toMatchObject({
      code: "VALIDATION_FAILED",
      fieldErrors: { name: expect.any(String) },
    });
  });

  it("replaces unknown errors with a generic INTERNAL error (no cause, no stack)", () => {
    const mapped = toPublicError(new Error("db password is hunter2"), "/x");
    expect(mapped).toEqual({
      code: "INTERNAL",
      message: "Internal Server Error",
    });
  });

  it("lets redirects and notFound through", () => {
    const r = redirect({ to: "/login" });
    const nf = notFound();
    expect(toPublicError(r, "/x")).toBe(r);
    expect(toPublicError(nf, "/x")).toBe(nf);
  });
});
