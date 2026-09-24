import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { z, ZodError } from "zod";
import { toPublicError } from "@/core/middleware/public-error";
import { zodInput } from "./zod-input";

vi.mock("@/core/logger/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

const schema = z.object({
  pageIndex: z.number().int().min(0),
  search: z.string().max(5).optional(),
});

describe("zodInput", () => {
  it("returns the parsed value for valid input", () => {
    expect(zodInput(schema)({ pageIndex: 2, search: "abc" })).toEqual({
      pageIndex: 2,
      search: "abc",
    });
  });

  it("throws a real ZodError for invalid input", () => {
    expect(() => zodInput(schema)({ pageIndex: -1 })).toThrow(ZodError);
  });

  it("rejects wrong runtime types even when TypeScript would allow nothing else", () => {
    const slug = zodInput(z.string().min(1));
    expect(() => slug({ $ne: null } as unknown as string)).toThrow(ZodError);
  });

  it("produces VALIDATION_FAILED (not INTERNAL) through the error pipeline", () => {
    let thrown: unknown;
    try {
      zodInput(schema)({ pageIndex: -1, search: "too long" });
    } catch (error) {
      thrown = error;
    }
    expect(toPublicError(thrown, "/x")).toMatchObject({
      code: "VALIDATION_FAILED",
      fieldErrors: {
        pageIndex: expect.any(String),
        search: expect.any(String),
      },
    });
  });

  it("types the caller's input from the schema", () => {
    const validate = zodInput(schema);
    expectTypeOf(validate).parameter(0).toEqualTypeOf<{
      pageIndex: number;
      search?: string | undefined;
    }>();
  });
});
