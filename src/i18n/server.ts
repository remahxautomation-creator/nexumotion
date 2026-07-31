import { cookies } from "next/headers";
import {
  dictionaries,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
  type TranslationKey,
} from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "ar" || value === "en" ? value : DEFAULT_LOCALE;
}

// Server-side translator for server components.
export async function getT() {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  return {
    locale,
    t: (key: TranslationKey) => dict[key] ?? dictionaries.en[key] ?? key,
  };
}
