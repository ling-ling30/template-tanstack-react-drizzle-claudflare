import { describe, it, expect } from "vitest";
import {
  getCountryByCode,
  getCountryByDialCode,
  extractDigits,
  formatPhoneNumber,
  fallbackFormatPhoneNumber,
  fallbackIsValidPhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "./phone";

describe("phone utilities", () => {
  it("retrieves country by ISO code", () => {
    const us = getCountryByCode("US");
    expect(us).toBeDefined();
    expect(us?.dialCode).toBe("+1");

    const id = getCountryByCode("id");
    expect(id).toBeDefined();
    expect(id?.name).toBe("Indonesia");
    expect(id?.dialCode).toBe("+62");

    expect(getCountryByCode("ZZ")).toBeUndefined();
  });

  it("retrieves country by dial code", () => {
    const gb = getCountryByDialCode("+44");
    expect(gb).toBeDefined();
    expect(gb?.code).toBe("GB");

    const id = getCountryByDialCode("62");
    expect(id).toBeDefined();
    expect(id?.code).toBe("ID");
  });

  it("extracts pure digits", () => {
    expect(extractDigits("+1 (555) 123-4567")).toBe("15551234567");
    expect(extractDigits("abc123def456")).toBe("123456");
    expect(extractDigits("")).toBe("");
  });

  it("formats US national phone number with libphonenumber-js", () => {
    const us = getCountryByCode("US")!;
    expect(formatPhoneNumber("5551234567", us)).toBe("(555) 123-4567");
  });

  it("formats national phone numbers using built-in fallback mask formatter", () => {
    const us = getCountryByCode("US")!;
    expect(fallbackFormatPhoneNumber("555", us)).toBe("(555");
    expect(fallbackFormatPhoneNumber("5551234", us)).toBe("(555) 123-4");
    expect(fallbackFormatPhoneNumber("5551234567", us)).toBe("(555) 123-4567");

    const id = getCountryByCode("ID")!;
    expect(fallbackFormatPhoneNumber("81234567890", id)).toBe("812-3456-7890");
  });

  it("validates phone number lengths correctly with fallback and libphonenumber-js", () => {
    const us = getCountryByCode("US")!;
    expect(fallbackIsValidPhoneNumber("5551234567", us)).toBe(true);
    expect(fallbackIsValidPhoneNumber("555123", us)).toBe(false);
    expect(fallbackIsValidPhoneNumber("55512345678", us)).toBe(false);

    // libphonenumber-js validation for valid US number
    expect(isValidPhoneNumber("+12025550123", us)).toBe(true);
    // Invalid length
    expect(isValidPhoneNumber("123", us)).toBe(false);
  });

  it("parses full phone numbers with dial code prefix", () => {
    const parsedID = parsePhoneNumber("+6281234567890");
    expect(parsedID.country.code).toBe("ID");
    expect(parsedID.dialCode).toBe("+62");
    expect(parsedID.e164).toBe("+6281234567890");
    expect(parsedID.isValid).toBe(true);

    const parsedUS = parsePhoneNumber("+1 202 555 0123");
    expect(parsedUS.country.code).toBe("US");
    expect(parsedUS.dialCode).toBe("+1");
    expect(parsedUS.nationalNumber).toBe("2025550123");
    expect(parsedUS.isValid).toBe(true);
  });
});
