/**
 * Standardized, SSR-safe formatting utilities for dates, times, numbers,
 * currencies, percentages, durations, and bytes.
 *
 * Adheres to:
 * - Deterministic locale defaults ("en-US") to prevent SSR hydration mismatches.
 * - Graceful fallback handling for null/undefined/NaN values.
 * - Backwards-compatible signature for legacy formatDate(value, locale).
 */

export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_FALLBACK = "—";

/**
 * Safely parse any input into a valid Date object or null.
 */
export function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export type DatePreset =
  | "short"
  | "medium"
  | "long"
  | "full"
  | "weekday"
  | "month-year"
  | "numeric"
  | "iso";

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
  preset?: DatePreset;
  fallback?: string;
}

/**
 * Locale-aware date formatting.
 *
 * Supports backwards compatibility with formatDate(date, "en") or full options.
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  localeOrOptions?: string | FormatDateOptions,
  maybeOptions?: FormatDateOptions
): string {
  const isLegacyString = typeof localeOrOptions === "string";
  const opts: FormatDateOptions = isLegacyString
    ? { locale: localeOrOptions, ...maybeOptions }
    : (localeOrOptions ?? {});

  const fallback = opts.fallback ?? (isLegacyString ? "" : DEFAULT_FALLBACK);

  const date = parseDate(value);
  if (!date) return fallback;

  if (opts.preset === "iso") {
    return date.toISOString().split("T")[0]!;
  }

  const locale = opts.locale || DEFAULT_LOCALE;
  const { preset, fallback: _f, locale: _l, ...intlOpts } = opts;

  if (preset === "short") {
    intlOpts.dateStyle = intlOpts.dateStyle ?? "short";
  } else if (preset === "long") {
    intlOpts.dateStyle = intlOpts.dateStyle ?? "long";
  } else if (preset === "full") {
    intlOpts.dateStyle = intlOpts.dateStyle ?? "full";
  } else if (preset === "weekday") {
    intlOpts.weekday = intlOpts.weekday ?? "long";
    intlOpts.month = intlOpts.month ?? "short";
    intlOpts.day = intlOpts.day ?? "numeric";
    intlOpts.year = intlOpts.year ?? "numeric";
  } else if (preset === "month-year") {
    intlOpts.month = intlOpts.month ?? "long";
    intlOpts.year = intlOpts.year ?? "numeric";
  } else if (preset === "numeric") {
    intlOpts.year = intlOpts.year ?? "numeric";
    intlOpts.month = intlOpts.month ?? "2-digit";
    intlOpts.day = intlOpts.day ?? "2-digit";
  } else if (
    !intlOpts.dateStyle &&
    !intlOpts.year &&
    !intlOpts.month &&
    !intlOpts.day
  ) {
    // Default preset is medium ("Sep 25, 2026")
    intlOpts.dateStyle = "medium";
  }

  try {
    return new Intl.DateTimeFormat(locale, intlOpts).format(date);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Times
// ---------------------------------------------------------------------------

export type TimePreset = "12h" | "24h" | "seconds" | "short";

export interface FormatTimeOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
  preset?: TimePreset;
  fallback?: string;
}

/**
 * Format a time from a Date, timestamp, or ISO string.
 */
export function formatTime(
  value: Date | string | number | null | undefined,
  options?: FormatTimeOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  const date = parseDate(value);
  if (!date) return fallback;

  const locale = options?.locale || DEFAULT_LOCALE;
  const preset = options?.preset ?? "12h";
  const { preset: _p, fallback: _f, locale: _l, ...intlOpts } = options ?? {};

  if (preset === "12h") {
    intlOpts.hour = intlOpts.hour ?? "numeric";
    intlOpts.minute = intlOpts.minute ?? "2-digit";
    intlOpts.hour12 = true;
  } else if (preset === "24h") {
    intlOpts.hour = intlOpts.hour ?? "2-digit";
    intlOpts.minute = intlOpts.minute ?? "2-digit";
    intlOpts.hour12 = false;
  } else if (preset === "seconds") {
    intlOpts.hour = intlOpts.hour ?? "numeric";
    intlOpts.minute = intlOpts.minute ?? "2-digit";
    intlOpts.second = intlOpts.second ?? "2-digit";
    if (intlOpts.hour12 === undefined) intlOpts.hour12 = true;
  } else if (preset === "short") {
    intlOpts.timeStyle = "short";
  }

  try {
    return new Intl.DateTimeFormat(locale, intlOpts).format(date);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Date & Time Combined
// ---------------------------------------------------------------------------

export interface FormatDateTimeOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
  datePreset?: DatePreset;
  timePreset?: TimePreset;
  fallback?: string;
}

/**
 * Combined Date and Time formatting.
 */
export function formatDateTime(
  value: Date | string | number | null | undefined,
  options?: FormatDateTimeOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  const date = parseDate(value);
  if (!date) return fallback;

  const locale = options?.locale || DEFAULT_LOCALE;
  const {
    datePreset: _dp,
    timePreset: _tp,
    fallback: _f,
    locale: _l,
    ...intlOpts
  } = options ?? {};

  if (!intlOpts.dateStyle && !intlOpts.timeStyle && !intlOpts.year) {
    intlOpts.dateStyle = "medium";
    intlOpts.timeStyle = "short";
  }

  try {
    return new Intl.DateTimeFormat(locale, intlOpts).format(date);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Date Ranges
// ---------------------------------------------------------------------------

export interface FormatDateRangeOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
  separator?: string;
  fallback?: string;
}

/**
 * Format a range between two dates.
 */
export function formatDateRange(
  from: Date | string | number | null | undefined,
  to: Date | string | number | null | undefined,
  options?: FormatDateRangeOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  if (!fromDate && !toDate) return fallback;
  if (fromDate && !toDate) return formatDate(fromDate, options);
  if (!fromDate && toDate) return formatDate(toDate, options);

  const d1 = fromDate!;
  const d2 = toDate!;
  const locale = options?.locale || DEFAULT_LOCALE;
  const separator = options?.separator ?? " – ";

  // Use native Intl formatRange if supported
  try {
    const {
      fallback: _f,
      separator: _s,
      locale: _l,
      ...intlOpts
    } = options ?? {};
    if (!intlOpts.dateStyle && !intlOpts.year && !intlOpts.month) {
      intlOpts.dateStyle = "medium";
    }
    const dtf = new Intl.DateTimeFormat(locale, intlOpts);
    if (typeof dtf.formatRange === "function") {
      return dtf.formatRange(d1, d2);
    }
  } catch {
    // Graceful fallback to manual join below
  }

  if (d1.getTime() === d2.getTime()) {
    return formatDate(d1, options);
  }

  return `${formatDate(d1, options)}${separator}${formatDate(d2, options)}`;
}

// ---------------------------------------------------------------------------
// Relative Time ("5 minutes ago", "in 2 days")
// ---------------------------------------------------------------------------

export interface FormatRelativeTimeOptions {
  locale?: string;
  numeric?: "always" | "auto";
  style?: "long" | "short" | "narrow";
  now?: Date;
  fallback?: string;
}

/**
 * Relative time formatting (e.g. "just now", "5m ago", "yesterday").
 */
export function formatRelativeTime(
  value: Date | string | number | null | undefined,
  options?: FormatRelativeTimeOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  const date = parseDate(value);
  if (!date) return fallback;

  const now = options?.now ?? new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const locale = options?.locale || DEFAULT_LOCALE;

  if (Math.abs(diffSec) < 45) {
    return "just now";
  }

  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, {
      numeric: options?.numeric ?? "auto",
      style: options?.style ?? "short",
    });

    if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, "minute");
    }
    if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, "hour");
    }
    if (Math.abs(diffDay) < 7) {
      return rtf.format(diffDay, "day");
    }
    if (Math.abs(diffWeek) < 5) {
      return rtf.format(diffWeek, "week");
    }
    if (Math.abs(diffMonth) < 12) {
      return rtf.format(diffMonth, "month");
    }
    return rtf.format(diffYear, "year");
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Durations ("2h 15m", "45s")
// ---------------------------------------------------------------------------

export interface FormatDurationOptions {
  style?: "short" | "long";
  maxUnits?: number;
  fallback?: string;
}

/**
 * Format a duration in seconds or milliseconds into human-readable components.
 */
export function formatDuration(
  value: number | null | undefined,
  unit: "ms" | "s" | "m" = "s",
  options?: FormatDurationOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  let totalSeconds = Math.round(
    unit === "ms" ? value / 1000 : unit === "m" ? value * 60 : value
  );
  if (totalSeconds < 0) totalSeconds = Math.abs(totalSeconds);

  if (totalSeconds === 0) {
    return options?.style === "long" ? "0 seconds" : "0s";
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  const isLong = options?.style === "long";

  if (days > 0) {
    parts.push(isLong ? `${days} ${days === 1 ? "day" : "days"}` : `${days}d`);
  }
  if (hours > 0) {
    parts.push(
      isLong ? `${hours} ${hours === 1 ? "hour" : "hours"}` : `${hours}h`
    );
  }
  if (minutes > 0) {
    parts.push(
      isLong
        ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
        : `${minutes}m`
    );
  }
  if (seconds > 0 && parts.length === 0) {
    parts.push(
      isLong
        ? `${seconds} ${seconds === 1 ? "second" : "seconds"}`
        : `${seconds}s`
    );
  } else if (seconds > 0 && parts.length < (options?.maxUnits ?? 2)) {
    parts.push(
      isLong
        ? `${seconds} ${seconds === 1 ? "second" : "seconds"}`
        : `${seconds}s`
    );
  }

  const max = options?.maxUnits ?? 2;
  const sliced = parts.slice(0, max);
  return isLong ? sliced.join(", ") : sliced.join(" ");
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  locale?: string;
  decimals?: number;
  fallback?: string;
}

/**
 * Standard number formatting with thousand separators and decimal control.
 */
export function formatNumber(
  value: number | string | null | undefined,
  options?: FormatNumberOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  if (value === null || value === undefined || value === "") return fallback;
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return fallback;

  const locale = options?.locale || DEFAULT_LOCALE;
  const { decimals, fallback: _f, locale: _l, ...intlOpts } = options ?? {};

  const numberFormatOptions: Intl.NumberFormatOptions = { ...intlOpts };

  if (decimals !== undefined) {
    numberFormatOptions.minimumFractionDigits = decimals;
    numberFormatOptions.maximumFractionDigits = decimals;
  }

  try {
    return new Intl.NumberFormat(locale, numberFormatOptions).format(num);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Compact Numbers ("1.4K", "2.5M")
// ---------------------------------------------------------------------------

export interface FormatCompactNumberOptions extends Intl.NumberFormatOptions {
  locale?: string;
  decimals?: number;
  fallback?: string;
}

/**
 * Compact number formatting for large counts (e.g. photos, views).
 */
export function formatCompactNumber(
  value: number | string | null | undefined,
  options?: FormatCompactNumberOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  if (value === null || value === undefined || value === "") return fallback;
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return fallback;

  const locale = options?.locale || DEFAULT_LOCALE;
  const { decimals, fallback: _f, locale: _l, ...intlOpts } = options ?? {};

  const numberFormatOptions: Intl.NumberFormatOptions = {
    ...intlOpts,
    notation: "compact",
    compactDisplay: intlOpts.compactDisplay ?? "short",
  };

  if (decimals !== undefined) {
    numberFormatOptions.minimumFractionDigits = decimals;
    numberFormatOptions.maximumFractionDigits = decimals;
  }

  try {
    return new Intl.NumberFormat(locale, numberFormatOptions).format(num);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Currencies
// ---------------------------------------------------------------------------

export interface FormatCurrencyOptions extends Intl.NumberFormatOptions {
  locale?: string;
  currency?: string;
  decimals?: number;
  fallback?: string;
}

/**
 * Currency formatting with automatic symbol, grouping, and zero-decimal handling.
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currencyOrOptions?: string | FormatCurrencyOptions,
  maybeOptions?: FormatCurrencyOptions
): string {
  const isStringCurrency = typeof currencyOrOptions === "string";
  const opts: FormatCurrencyOptions = isStringCurrency
    ? { currency: currencyOrOptions, ...maybeOptions }
    : (currencyOrOptions ?? {});

  const fallback = opts.fallback ?? DEFAULT_FALLBACK;
  if (value === null || value === undefined || value === "") return fallback;
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return fallback;

  const locale = opts.locale || DEFAULT_LOCALE;
  const currency = opts.currency || DEFAULT_CURRENCY;
  const { decimals, fallback: _f, locale: _l, ...intlOpts } = opts;

  const numberFormatOptions: Intl.NumberFormatOptions = {
    ...intlOpts,
    style: "currency",
    currency,
  };

  if (decimals !== undefined) {
    numberFormatOptions.minimumFractionDigits = decimals;
    numberFormatOptions.maximumFractionDigits = decimals;
  }

  try {
    return new Intl.NumberFormat(locale, numberFormatOptions).format(num);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Percentages
// ---------------------------------------------------------------------------

export interface FormatPercentOptions extends Intl.NumberFormatOptions {
  locale?: string;
  decimals?: number;
  isFractional?: boolean; // if true (default), 0.125 -> 12.5%. If false, 12.5 -> 12.5%
  showSign?: boolean; // if true, prepends + for positive values
  fallback?: string;
}

/**
 * Percentage formatting (e.g. "94%", "+12.5%").
 */
export function formatPercent(
  value: number | string | null | undefined,
  options?: FormatPercentOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  if (value === null || value === undefined || value === "") return fallback;
  const rawNum = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(rawNum)) return fallback;

  const isFractional = options?.isFractional ?? true;
  const num = isFractional ? rawNum : rawNum / 100;

  const locale = options?.locale || DEFAULT_LOCALE;
  const {
    decimals,
    isFractional: _if,
    showSign,
    fallback: _f,
    locale: _l,
    ...intlOpts
  } = options ?? {};

  const numberFormatOptions: Intl.NumberFormatOptions = {
    ...intlOpts,
    style: "percent",
  };

  if (decimals !== undefined) {
    numberFormatOptions.minimumFractionDigits = decimals;
    numberFormatOptions.maximumFractionDigits = decimals;
  } else {
    numberFormatOptions.maximumFractionDigits = 2;
  }

  if (showSign && rawNum > 0) {
    numberFormatOptions.signDisplay = "always";
  }

  try {
    return new Intl.NumberFormat(locale, numberFormatOptions).format(num);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Bytes / Storage Size
// ---------------------------------------------------------------------------

export interface FormatBytesOptions {
  decimals?: number;
  standard?: "metric" | "binary";
  binaryUnits?: boolean; // if true, uses KiB, MiB. Default false (KB, MB)
  fallback?: string;
}

/**
 * Format bytes to readable human-friendly file and storage size (e.g. "18.4 GB", "500 KB").
 */
export function formatBytes(
  bytes: number | string | null | undefined,
  options?: FormatBytesOptions
): string {
  const fallback = options?.fallback ?? DEFAULT_FALLBACK;
  if (bytes === null || bytes === undefined || bytes === "") return fallback;
  const num = typeof bytes === "string" ? Number(bytes) : bytes;
  if (Number.isNaN(num) || num < 0) return fallback;
  if (num === 0) return "0 B";

  const isMetric = options?.standard === "metric";
  const base = isMetric ? 1000 : 1024;
  const isBinaryUnits = options?.binaryUnits ?? false;

  const unitsMetric = ["B", "KB", "MB", "GB", "TB", "PB"];
  const unitsBinary = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
  const units = isBinaryUnits ? unitsBinary : unitsMetric;

  const exponent = Math.min(
    Math.floor(Math.log(num) / Math.log(base)),
    units.length - 1
  );

  const value = num / Math.pow(base, exponent);
  const decimals = options?.decimals ?? (exponent === 0 ? 0 : 1);

  const formattedVal = new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);

  return `${formattedVal} ${units[exponent]}`;
}
