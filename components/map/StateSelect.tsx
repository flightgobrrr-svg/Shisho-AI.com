"use client";

import { useId, useState } from "react";
import {
  HIGH_COURT_BY_STATE,
  STATES,
  UNION_TERRITORIES,
  type StateName,
} from "@/lib/states";
import { LOCALE_BCP47, type Locale } from "@/lib/i18n/dictionaries";
import { courtLabel, getStatePickerCopy, stateLabel } from "@/lib/i18n/statePicker";
import { cn } from "@/lib/cn";

/**
 * Picks the state or union territory a matter belongs to, at stage 3 of the
 * map, and answers the question that follows: which High Court hears it.
 *
 * It used to print "Matter in Maharashtra." and stop — 37 options with no
 * consequence, on a page whose own contract is that everything leads
 * somewhere. Naming the court is the answer a litigant actually needs, and it
 * is the one thing the state name alone does not give you: Goa is the Bombay
 * High Court, Puducherry is Madras, Chandigarh is Punjab and Haryana, and four
 * north-eastern states share Gauhati. The mapping is verified in lib/states.ts.
 *
 * A native <select> on purpose. It is keyboard-accessible and screen-reader
 * correct for free, it gets the platform's own picker on a phone — which for
 * 36 options beats anything rebuilt in a div — and it needs no dependency and
 * no open/close state. <optgroup> carries the constitutional distinction
 * between a state and a union territory, which a flat list would flatten away.
 *
 * On the translated homepages every word of it is in the page's language
 * (lib/i18n/statePicker.ts), the names sorted in that language's own order
 * so they can be found by their first letter. The option values stay the
 * English names, so the court lookup is the same verified table either way.
 */
export function StateSelect({
  className,
  label,
  locale = "en",
}: {
  className?: string;
  /** /map asks about the matter's location (it decides jurisdiction); the
   *  homepage hero asks about the visitor instead — same picker, same
   *  derived High Court, a question that actually fits a first-time
   *  visitor rather than someone mid-filing. Defaults to the matter. */
  label?: string;
  locale?: Locale;
}) {
  const id = useId();
  const [selected, setSelected] = useState<StateName | "">("");
  const court = selected ? HIGH_COURT_BY_STATE[selected] : null;
  const copy = getStatePickerCopy(locale);
  const translated = locale !== "en";
  const ordered = (names: readonly StateName[]) => {
    if (!translated) return names;
    const collator = new Intl.Collator(LOCALE_BCP47[locale]);
    return [...names].sort((a, b) => collator.compare(stateLabel(copy, a), stateLabel(copy, b)));
  };

  return (
    <div className={cn("mt-5 ml-9.5 max-w-md", className)}>
      <label htmlFor={id} className="label-mono block text-ink-soft">
        {label ?? copy.askMatter}
      </label>

      <select
        id={id}
        value={selected}
        onChange={(e) => setSelected(e.target.value as StateName | "")}
        className="mt-2.5 block min-h-11 w-full rounded-seal border border-ink/45 bg-paper-raised px-3 py-2.5 font-sans text-[14.5px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75"
      >
        <option value="">{copy.placeholder}</option>
        <optgroup label={copy.statesGroup}>
          {ordered(STATES).map((s) => (
            <option key={s} value={s}>
              {stateLabel(copy, s)}
            </option>
          ))}
        </optgroup>
        <optgroup label={copy.territoriesGroup}>
          {ordered(UNION_TERRITORIES).map((u) => (
            <option key={u} value={u}>
              {stateLabel(copy, u)}
            </option>
          ))}
        </optgroup>
      </select>

      {/* aria-live so the answer is announced, not merely drawn. The key is
          the selection, so React remounts the line and the arrival animation
          replays for each new answer instead of firing once. */}
      {/* Height reserved. "High Court of Jammu & Kashmir and Ladakh" wraps to
          two lines where every other answer takes one, and the 26px growth
          shunted stages 4 to 9 down the page while the reader was mid-read. */}
      {/* Translated pages reserve a third line: the court's English legal
          name follows the translated one, since that is the name a filing
          uses. */}
      <p
        aria-live="polite"
        className={cn(
          "mt-3 text-[14px] leading-relaxed",
          translated ? "min-h-[4.5rem]" : "min-h-13",
        )}
      >
        {court ? (
          <span key={selected} className="answer-in block">
            {copy.answerSentence ? (
              <>
                <span className="text-ink-soft">{copy.answerSentence[0]}</span>{" "}
                <span className="font-display text-[16px] font-semibold text-ink">
                  {court}
                </span>
                <span className="text-ink-soft">{copy.answerSentence[1]}</span>
              </>
            ) : (
              <>
                <span className="text-ink-soft">{copy.answerLabel}</span>{" "}
                <span className="font-display text-[16px] font-semibold text-ink">
                  {courtLabel(copy, court)}
                </span>{" "}
                <span lang="en" className="text-[13px] whitespace-nowrap text-ink-faint">
                  ({court})
                </span>
              </>
            )}
          </span>
        ) : (
          <span className="text-ink-soft">{copy.note}</span>
        )}
      </p>
    </div>
  );
}
