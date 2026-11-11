"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, LOCALES, LOCALE_BCP47, LOCALE_LABELS, LOCALE_PATHS, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/cn";

/**
 * A native <select> over every locale that has a real translated homepage —
 * same reasoning as components/map/StateSelect.tsx: keyboard-accessible and
 * screen-reader correct for free, and the platform's own picker on a phone.
 *
 * This used to be a single plain <Link> toggling English <-> Hindi — fine
 * for two languages, but a lone "हिंदी में देखें" link reads as sparse once
 * there are six languages to offer. A <select> is what a list that size
 * actually is: a menu, not a row of loose links. That does mean this is no
 * longer a zero-JS server component (Hero itself still is; only this piece
 * needs the client for the navigation-on-change), the same trade StateSelect
 * already makes elsewhere in this same Hero.
 */
export function LanguageSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const t = getDictionary(locale).languageSwitch;
  const router = useRouter();
  const id = useId();

  return (
    <>
      {/* The label and the selected name are in the current language, even
          inside the English nav, so the select carries that language. */}
      <label htmlFor={id} lang={LOCALE_BCP47[locale]} className="sr-only">
        {t.label}
      </label>
      <select
        id={id}
        lang={LOCALE_BCP47[locale]}
        value={locale}
        onChange={(e) => router.push(LOCALE_PATHS[e.target.value as Locale])}
        className={cn(
          "label-mono min-h-8 rounded-seal border border-ink/45 bg-paper-raised px-2.5 py-1 text-[12px] text-ink-soft",
          "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75 hover:text-ink",
          className,
        )}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={LOCALE_BCP47[l]}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </>
  );
}
