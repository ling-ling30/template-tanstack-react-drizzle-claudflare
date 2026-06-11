import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import idCommon from "./locales/id/common.json";

export const SUPPORTED_LANGUAGES = ["en", "id"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

/**
 * App-wide i18next instance.
 *
 * Resources are typed and split by namespace (`common` here). Add namespaces as
 * the app grows (e.g. `documents`, `auth`) instead of one giant file.
 *
 * Rule for this codebase: NO hardcoded user-facing strings in components.
 * Every visible string goes through `t("namespace.key")`. See README + CLAUDE.md.
 */
export const resources = {
  en: { common: enCommon },
  id: { common: idCommon },
} as const;

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      defaultNS: "common",
      interpolation: {
        escapeValue: false, // React already escapes
      },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
      },
    });
}

export default i18n;
