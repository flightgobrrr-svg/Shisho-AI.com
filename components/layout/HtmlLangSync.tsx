"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_BCP47, LOCALE_DIR, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Keeps <html lang> (and, for the two Perso-Arabic/Nastaliq locales,
 * <html dir>) accurate without a [lang] route segment — see
 * lib/i18n/dictionaries.ts for why this project isn't restructured under
 * app/[lang] yet (that's the real, invasive, official pattern; this is the
 * additive stand-in). A client-side correction after first paint is an
 * accepted imperfection: a screen reader announcing the page as English for
 * one frame before this runs costs less than moving every route today.
 *
 * Driven off LOCALES/LOCALE_PATHS rather than a single hardcoded "/hi"
 * check — that hardcoding previously meant every non-Hindi translated
 * route (bn, mr, te, ta, gu) silently kept the English lang tag.
 */
const NON_DEFAULT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export function HtmlLangSync() {
  const pathname = usePathname();

  useEffect(() => {
    const matched = NON_DEFAULT_LOCALES.find(
      (l) => pathname === `/${l}` || pathname?.startsWith(`/${l}/`),
    );
    const locale: Locale = matched ?? DEFAULT_LOCALE;
    document.documentElement.lang = LOCALE_BCP47[locale];
    document.documentElement.dir = LOCALE_DIR[locale];
  }, [pathname]);

  return null;
}
