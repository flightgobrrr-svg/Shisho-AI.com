"use client";

import { useId, useState } from "react";
import { STATES, UNION_TERRITORIES, type StateName } from "@/lib/states";

/**
 * Picks the state or union territory a matter belongs to, at stage 3 of the
 * map.
 *
 * A native <select> on purpose. It is keyboard-accessible and screen-reader
 * correct for free, it gets the platform's own picker on a phone — which for
 * 36 options beats anything rebuilt in a div — and it needs no dependency and
 * no open/close state. <optgroup> carries the constitutional distinction
 * between a state and a union territory, which is exactly the sort of thing a
 * flat list would flatten away.
 *
 * The selection deliberately does NOT claim which High Court has jurisdiction.
 * That mapping is real legal information — several High Courts sit over more
 * than one state or union territory — and this project does not ship legal
 * claims that have not been checked against a source.
 */
export function StateSelect() {
  const id = useId();
  const [selected, setSelected] = useState<StateName | "">("");

  return (
    <div className="mt-4 ml-9.5 max-w-md">
      <label
        htmlFor={id}
        className="label-mono block text-ink-soft/70"
      >
        Where is the matter
      </label>

      <select
        id={id}
        value={selected}
        onChange={(e) => setSelected(e.target.value as StateName | "")}
        className="mt-2.5 block w-full rounded-seal border border-ink/45 bg-paper-raised px-3 py-2.5 font-sans text-[14.5px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75"
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

      {/* aria-live so the confirmation is announced, not just drawn. */}
      <p aria-live="polite" className="mt-2.5 text-[13.5px] text-ink-soft">
        {selected ? (
          <>
            Matter in <span className="text-ink">{selected}</span>.
          </>
        ) : (
          <span className="text-ink-soft/70">
            28 states and 8 union territories.
          </span>
        )}
      </p>
    </div>
  );
}
