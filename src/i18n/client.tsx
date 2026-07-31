"use client";

import { createContext, useContext } from "react";
import {
  dictionaries,
  DEFAULT_LOCALE,
  type Locale,
  type TranslationKey,
} from "./dictionaries";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

// Translator hook for client components.
export function useT() {
  const locale = useContext(LocaleContext);
  const dict = dictionaries[locale];
  const t = (key: TranslationKey) => dict[key] ?? dictionaries.en[key] ?? key;
  return { t, locale, isRtl: locale === "ar" };
}
