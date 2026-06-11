import { type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./config";

/**
 * Wraps the app so every component can call `useTranslation()`.
 * Mounted once near the root (see `routes/__root.tsx`).
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
