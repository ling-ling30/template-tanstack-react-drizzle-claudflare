import {
  AsYouType,
  parsePhoneNumberFromString,
  isValidPhoneNumber as libIsValidPhoneNumber,
  type CountryCode,
} from "libphonenumber-js";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: string;
  minLength: number;
  maxLength: number;
}

export const COUNTRIES: Country[] = [
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    format: "(###) ###-####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    format: "(###) ###-####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    format: "#### ######",
    minLength: 10,
    maxLength: 11,
  },
  {
    code: "ID",
    name: "Indonesia",
    dialCode: "+62",
    flag: "🇮🇩",
    format: "###-####-####",
    minLength: 9,
    maxLength: 12,
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    format: "#### ### ###",
    minLength: 9,
    maxLength: 10,
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
    format: "#### #######",
    minLength: 10,
    maxLength: 12,
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
    format: "## ## ## ## ##",
    minLength: 9,
    maxLength: 10,
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    flag: "🇯🇵",
    format: "##-####-####",
    minLength: 10,
    maxLength: 11,
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    format: "#### ####",
    minLength: 8,
    maxLength: 8,
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    flag: "🇲🇾",
    format: "##-### ####",
    minLength: 9,
    maxLength: 10,
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    format: "#####-#####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "CN",
    name: "China",
    dialCode: "+86",
    flag: "🇨🇳",
    format: "### #### ####",
    minLength: 11,
    maxLength: 11,
  },
  {
    code: "KR",
    name: "South Korea",
    dialCode: "+82",
    flag: "🇰🇷",
    format: "##-####-####",
    minLength: 9,
    maxLength: 11,
  },
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    flag: "🇳🇱",
    format: "## ########",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "CH",
    name: "Switzerland",
    dialCode: "+41",
    flag: "🇨🇭",
    format: "## ### ## ##",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "ES",
    name: "Spain",
    dialCode: "+34",
    flag: "🇪🇸",
    format: "### ## ## ##",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    flag: "🇮🇹",
    format: "### #######",
    minLength: 9,
    maxLength: 11,
  },
  {
    code: "BR",
    name: "Brazil",
    dialCode: "+55",
    flag: "🇧🇷",
    format: "(##) #####-####",
    minLength: 10,
    maxLength: 11,
  },
  {
    code: "MX",
    name: "Mexico",
    dialCode: "+52",
    flag: "🇲🇽",
    format: "### ### ####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "NZ",
    name: "New Zealand",
    dialCode: "+64",
    flag: "🇳🇿",
    format: "### ### ####",
    minLength: 8,
    maxLength: 10,
  },
  {
    code: "PH",
    name: "Philippines",
    dialCode: "+63",
    flag: "🇵🇭",
    format: "### ### ####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "TH",
    name: "Thailand",
    dialCode: "+66",
    flag: "🇹🇭",
    format: "## ### ####",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "VN",
    name: "Vietnam",
    dialCode: "+84",
    flag: "🇻🇳",
    format: "### ### ####",
    minLength: 9,
    maxLength: 10,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
    format: "## ### ####",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    flag: "🇸🇦",
    format: "## ### ####",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "ZA",
    name: "South Africa",
    dialCode: "+27",
    flag: "🇿🇦",
    format: "## ### ####",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "SE",
    name: "Sweden",
    dialCode: "+46",
    flag: "🇸🇪",
    format: "###-### ##",
    minLength: 7,
    maxLength: 10,
  },
  {
    code: "NO",
    name: "Norway",
    dialCode: "+47",
    flag: "🇳🇴",
    format: "### ## ###",
    minLength: 8,
    maxLength: 8,
  },
  {
    code: "DK",
    name: "Denmark",
    dialCode: "+45",
    flag: "🇩🇰",
    format: "## ## ## ##",
    minLength: 8,
    maxLength: 8,
  },
  {
    code: "FI",
    name: "Finland",
    dialCode: "+358",
    flag: "🇫🇮",
    format: "### #######",
    minLength: 7,
    maxLength: 11,
  },
  {
    code: "IE",
    name: "Ireland",
    dialCode: "+353",
    flag: "🇮🇪",
    format: "### ### ####",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "AT",
    name: "Austria",
    dialCode: "+43",
    flag: "🇦🇹",
    format: "#### ######",
    minLength: 10,
    maxLength: 13,
  },
  {
    code: "BE",
    name: "Belgium",
    dialCode: "+32",
    flag: "🇧🇪",
    format: "### ## ## ##",
    minLength: 8,
    maxLength: 9,
  },
  {
    code: "PL",
    name: "Poland",
    dialCode: "+48",
    flag: "🇵🇱",
    format: "### ### ###",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "PT",
    name: "Portugal",
    dialCode: "+351",
    flag: "🇵🇹",
    format: "### ### ###",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "HK",
    name: "Hong Kong",
    dialCode: "+852",
    flag: "🇭🇰",
    format: "#### ####",
    minLength: 8,
    maxLength: 8,
  },
  {
    code: "TW",
    name: "Taiwan",
    dialCode: "+886",
    flag: "🇹🇼",
    format: "### ### ###",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "NG",
    name: "Nigeria",
    dialCode: "+234",
    flag: "🇳🇬",
    format: "### ### ####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "EG",
    name: "Egypt",
    dialCode: "+20",
    flag: "🇪🇬",
    format: "### ### ####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "TR",
    name: "Turkey",
    dialCode: "+90",
    flag: "🇹🇷",
    format: "### ### ## ##",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "AR",
    name: "Argentina",
    dialCode: "+54",
    flag: "🇦🇷",
    format: "## ####-####",
    minLength: 10,
    maxLength: 10,
  },
  {
    code: "CL",
    name: "Chile",
    dialCode: "+56",
    flag: "🇨🇱",
    format: "# #### ####",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "CO",
    name: "Colombia",
    dialCode: "+57",
    flag: "🇨🇴",
    format: "### ### ####",
    minLength: 10,
    maxLength: 10,
  },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]!;

export function getCountryByCode(code: string): Country | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === upper);
}

export function getCountryByDialCode(dialCode: string): Country | undefined {
  if (!dialCode) return undefined;
  const formatted = dialCode.startsWith("+") ? dialCode : `+${dialCode}`;
  return COUNTRIES.find((c) => c.dialCode === formatted);
}

/**
 * Extracts pure digits from any input string.
 */
export function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Built-in fallback mask formatter:
 * Maps digits into `#` placeholders in country format (e.g. `(###) ###-####`).
 */
export function fallbackFormatPhoneNumber(
  rawDigits: string,
  country: Country
): string {
  const digits = extractDigits(rawDigits);
  if (!digits) return "";

  const maxDigits = country.maxLength || 15;
  const truncatedDigits = digits.slice(0, maxDigits);

  if (!country.format) {
    return truncatedDigits;
  }

  let formatted = "";
  let digitIndex = 0;

  for (
    let i = 0;
    i < country.format.length && digitIndex < truncatedDigits.length;
    i++
  ) {
    const char = country.format[i];
    if (char === "#") {
      formatted += truncatedDigits[digitIndex];
      digitIndex++;
    } else {
      formatted += char;
    }
  }

  if (digitIndex < truncatedDigits.length) {
    formatted += " " + truncatedDigits.slice(digitIndex);
  }

  return formatted;
}

/**
 * Built-in fallback validator: length & rule-based checks.
 */
export function fallbackIsValidPhoneNumber(
  value: string,
  countryOrCode?: Country | string
): boolean {
  if (!value) return false;
  const digits = extractDigits(value);
  if (!digits) return false;

  const country =
    typeof countryOrCode === "string"
      ? getCountryByCode(countryOrCode)
      : countryOrCode;

  if (country) {
    return (
      digits.length >= country.minLength && digits.length <= country.maxLength
    );
  }

  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Formats a phone number as you type.
 * Uses `libphonenumber-js`'s AsYouType formatter as primary engine,
 * falling back to our custom mask formatter if unavailable or empty.
 */
export function formatPhoneNumber(
  rawDigits: string,
  country?: Country
): string {
  const activeCountry = country || DEFAULT_COUNTRY;
  const digits = extractDigits(rawDigits);
  if (!digits) return "";

  // 1. Primary Engine: libphonenumber-js AsYouType
  try {
    const asYouType = new AsYouType(activeCountry.code as CountryCode);
    const result = asYouType.input(digits);
    if (result && result.trim()) {
      return result;
    }
  } catch {
    // If libphonenumber-js throws, proceed to fallback
  }

  // 2. Built-in Fallback Engine
  return fallbackFormatPhoneNumber(digits, activeCountry);
}

export interface ParsedPhone {
  country: Country;
  dialCode: string;
  nationalNumber: string;
  formatted: string;
  e164: string;
  isValid: boolean;
}

/**
 * Validates whether the national digits match the country rules.
 * Uses `libphonenumber-js` validation first, falling back to our min/max digit rules.
 */
export function isValidPhoneNumber(
  value: string,
  countryOrCode?: Country | string
): boolean {
  if (!value) return false;
  const digits = extractDigits(value);
  if (!digits) return false;

  const country =
    typeof countryOrCode === "string"
      ? getCountryByCode(countryOrCode)
      : countryOrCode;

  // 1. Primary Engine: libphonenumber-js validation
  try {
    const countryCode = (country?.code || "US") as CountryCode;
    // Check with full national number or with dial code
    const fullNumber = country ? `${country.dialCode}${digits}` : value;
    if (libIsValidPhoneNumber(fullNumber, countryCode)) {
      return true;
    }
    // Also try parsePhoneNumberFromString for possible number
    const parsed = parsePhoneNumberFromString(fullNumber, countryCode);
    if (parsed && parsed.isValid()) {
      return true;
    }
  } catch {
    // Proceed to fallback
  }

  // 2. Built-in Fallback Engine: length & rule-based checks
  if (country) {
    return (
      digits.length >= country.minLength && digits.length <= country.maxLength
    );
  }

  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Parses full phone strings (supporting raw national, leading +, or dial code pasted).
 * Uses libphonenumber-js first, with fallback to built-in dial code matching.
 */
export function parsePhoneNumber(
  value: string,
  defaultCountryCode = "US"
): ParsedPhone {
  const defaultCountry =
    getCountryByCode(defaultCountryCode) || DEFAULT_COUNTRY;
  const trimmed = value.trim();

  // 1. Primary Engine: parse with libphonenumber-js
  try {
    const parsed = parsePhoneNumberFromString(
      trimmed,
      (defaultCountry.code as CountryCode) || "US"
    );
    if (parsed) {
      const countryCode = parsed.country;
      const matchedCountry = countryCode
        ? getCountryByCode(countryCode)
        : defaultCountry;
      const activeCountry = matchedCountry || defaultCountry;

      const nationalNumber = parsed.nationalNumber || extractDigits(trimmed);
      const formatted =
        parsed.formatNational() ||
        formatPhoneNumber(nationalNumber, activeCountry);
      const e164 =
        parsed.number || `${activeCountry.dialCode}${nationalNumber}`;
      const valid =
        parsed.isValid() || isValidPhoneNumber(nationalNumber, activeCountry);

      return {
        country: activeCountry,
        dialCode: activeCountry.dialCode,
        nationalNumber,
        formatted,
        e164,
        isValid: valid,
      };
    }
  } catch {
    // Proceed to fallback
  }

  // 2. Built-in Fallback Engine
  if (trimmed.startsWith("+")) {
    const sortedCountries = [...COUNTRIES].sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    );

    for (const c of sortedCountries) {
      if (trimmed.startsWith(c.dialCode)) {
        const nationalPart = trimmed.slice(c.dialCode.length);
        const digits = extractDigits(nationalPart);
        const formatted = formatPhoneNumber(digits, c);
        const e164 = digits ? `${c.dialCode}${digits}` : "";
        const valid = isValidPhoneNumber(digits, c);
        return {
          country: c,
          dialCode: c.dialCode,
          nationalNumber: digits,
          formatted,
          e164,
          isValid: valid,
        };
      }
    }
  }

  const digits = extractDigits(trimmed);
  const formatted = formatPhoneNumber(digits, defaultCountry);
  const e164 = digits ? `${defaultCountry.dialCode}${digits}` : "";
  const valid = isValidPhoneNumber(digits, defaultCountry);

  return {
    country: defaultCountry,
    dialCode: defaultCountry.dialCode,
    nationalNumber: digits,
    formatted,
    e164,
    isValid: valid,
  };
}
