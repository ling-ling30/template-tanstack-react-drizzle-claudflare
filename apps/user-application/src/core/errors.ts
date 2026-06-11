import type { AppError } from "@repo/data-ops/errors";
import i18n from "@/i18n/config";

/**
 * Maps an AppError to a localized, user-facing message.
 *
 * Messages live in the `errors` namespace of each locale (keyed by error code),
 * so they are translatable like everything else — no hardcoded strings here.
 * Falls back to the raw error message if a key is somehow missing.
 *
 * Usable outside React (uses the i18n instance directly). Inside components you
 * can also do: `const { t } = useTranslation(); t(\`errors.${error.code}\`)`.
 */
export function getErrorMessage(error: AppError): string {
  const key = `errors.${error.code}` as const;
  const translated = i18n.t(key);
  // i18next returns the key itself when missing — fall back to the raw message.
  return translated === key ? error.message : translated;
}
