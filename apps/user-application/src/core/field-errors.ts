import { isAppError } from "@repo/data-ops/errors";
import i18n from "@/i18n/config";

/**
 * Per-field problems from a failed server call, keyed by field name, as
 * localized sentences ready to show under each form input.
 * Returns null when the error isn't about specific fields.
 */
export function fieldErrorsOf(error: unknown): Record<string, string> | null {
  if (!isAppError(error) || !error.fieldErrors) return null;
  const out: Record<string, string> = {};
  for (const [field, token] of Object.entries(error.fieldErrors)) {
    out[field] = fieldErrorMessage(token);
  }
  return out;
}

/**
 * Turns a language-neutral rule token from the server (see middleware/public-error.ts)
 * into a localized sentence: "too_small:3" → "At least 3 characters."
 */
export function fieldErrorMessage(token: string): string {
  const [rule, arg] = token.split(":");
  switch (rule) {
    case "too_small":
      return i18n.t("fieldErrors.tooShort", { count: Number(arg) });
    case "too_big":
      return i18n.t("fieldErrors.tooLong", { count: Number(arg) });
    case "invalid_format":
      return i18n.t("fieldErrors.format");
    case "invalid_date":
      return i18n.t("fieldErrors.date");
    case "invalid_time":
      return i18n.t("fieldErrors.time");
    case "required":
      return i18n.t("fieldErrors.required");
    default:
      return i18n.t("fieldErrors.invalid");
  }
}

/**
 * Maps a field's key to its localized name: "user.email" → "Email".
 */
export function fieldLabel(key: string): string | null {
  const last = key.split(".").pop() ?? key;
  const i18nKey = `fieldNames.${last}`;
  return i18n.exists(i18nKey) ? i18n.t(i18nKey as any) : null;
}

/**
 * One line summarizing the first field issue, suitable for toast notifications:
 * "Email: Required." Returns null if no field error metadata exists.
 */
export function describeFieldErrors(error: unknown): string | null {
  if (!isAppError(error) || !error.fieldErrors) return null;
  const entries = Object.entries(error.fieldErrors);
  const first = entries[0];
  if (!first) return null;
  const [firstKey, firstToken] = first;
  const label = fieldLabel(firstKey);
  const message = fieldErrorMessage(firstToken);
  return label ? `${label}: ${message}` : message;
}
