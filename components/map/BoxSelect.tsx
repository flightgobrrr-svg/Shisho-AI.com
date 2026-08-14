"use client";

import { useState } from "react";

/**
 * The choice inside a map box — e.g. Arguments: written or oral.
 *
 * Only the <select> is a client component; the box around it stays server-
 * rendered. It sits inline so the box keeps the same height as every other box
 * in the row, separated from the label by a hairline rather than a border of
 * its own — a box inside a box would read as two things.
 *
 * `aria-label` carries the box's label, because the visible text sits in a
 * sibling element the select does not own.
 */
export function BoxSelect({
  label,
  options,
}: {
  label: string;
  options: readonly string[];
}) {
  const [value, setValue] = useState(options[0]);

  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="ml-1 shrink-0 cursor-pointer border-l border-ink/25 bg-transparent py-0.5 pl-2.5 font-sans text-[13.5px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink focus-visible:text-ink"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
