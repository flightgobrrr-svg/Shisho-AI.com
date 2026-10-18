"use client";

import { useId, useState } from "react";
import {
  HIGH_COURT_BY_STATE,
  STATES,
  UNION_TERRITORIES,
  type StateName,
} from "@/lib/states";
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
 */
export function StateSelect({
  className,
  label = "Where is the matter",
}: {
  className?: string;
  /** /map asks about the matter's location (it decides jurisdiction); the
   *  homepage hero asks about the visitor instead — same picker, same
   *  derived High Court, a question that actually fits a first-time
   *  visitor rather than someone mid-filing. */
  label?: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState<StateName | "">("");
  const court = selected ? HIGH_COURT_BY_STATE[selected] : null;

  return (
    <div className={cn("mt-5 ml-9.5 max-w-md", className)}>
      <label htmlFor={id} className="label-mono block text-ink-soft">
        {label}
      </label>

      <select
        id={id}
        value={selected}
        onChange={(e) => setSelected(e.target.value as StateName | "")}
        className="mt-2.5 block min-h-11 w-full rounded-seal border border-ink/45 bg-paper-raised px-3 py-2.5 font-sans text-[14.5px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75"
      >
        <option value="">Select a state or union territory…</option>
        <optgroup label="States">
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </optgroup>
        <optgroup label="Union territories">
          {UNION_TERRITORIES.map((u) => (
            <option key={u} value={u}>
              {u}
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
      <p
        aria-live="polite"
        className="mt-3 min-h-13 text-[14px] leading-relaxed"
      >
        {court ? (
          <span key={selected} className="answer-in block">
            <span className="text-ink-soft">Writ jurisdiction lies with the</span>{" "}
            <span className="font-display text-[16px] font-semibold text-ink">
              {court}
            </span>
            <span className="text-ink-soft">.</span>
          </span>
        ) : (
          <span className="text-ink-soft">
            28 states and 8 union territories, and the High Court over each.
          </span>
        )}
      </p>
    </div>
  );
}
