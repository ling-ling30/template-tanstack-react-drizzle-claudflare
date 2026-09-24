/** Locale-aware short date ("24 Sep 2026"). Accepts Date or ISO string. */
export function formatDate(value: Date | string, locale: string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}
