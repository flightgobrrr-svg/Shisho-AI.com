"use client";

import { useState } from "react";
import { LIMITATION_ENTRIES, lastDay, periodLabel } from "@/lib/limitation";

const FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function LimitationChecker({
  initialEntry,
  initialDate,
}: {
  initialEntry?: string;
  initialDate?: string;
}) {
  const [entryId, setEntryId] = useState(
    LIMITATION_ENTRIES.some((e) => e.id === initialEntry) ? initialEntry! : LIMITATION_ENTRIES[0].id,
  );
  const [date, setDate] = useState(
    initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : "",
  );
  const [copied, setCopied] = useState(false);

  const entry = LIMITATION_ENTRIES.find((e) => e.id === entryId)!;
  const start = date ? new Date(`${date}T00:00:00Z`) : null;
  const valid = start && !Number.isNaN(start.getTime());
  const end = valid ? lastDay(start, entry.period) : null;
  const outer = valid && entry.outer ? lastDay(start, entry.outer.period) : null;

  const inputClass =
    "mt-2 h-11 w-full rounded-seal border border-ink/45 bg-paper px-3 text-[15px] text-ink focus:border-ink/80 focus:outline-none";

  async function copyLink() {
    const url = `${window.location.origin}/limitation?a=${entryId}&d=${date}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-6">
        <div>
          <label htmlFor="lim-entry" className="label-mono text-indigo">
            What is the claim for?
          </label>
          <select
            id="lim-entry"
            value={entryId}
            onChange={(e) => {
              setEntryId(e.target.value);
              setCopied(false);
            }}
            className={inputClass}
          >
            {LIMITATION_ENTRIES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label} — {e.article}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="lim-date" className="label-mono text-indigo">
            {entry.dateLabel}
          </label>
          <input
            id="lim-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setCopied(false);
            }}
            className={inputClass}
          />
        </div>

        <div className="border-l border-ink/25 pl-5 text-[14px] leading-relaxed text-ink-soft">
          <p className="label-mono text-ink">{entry.article}</p>
          <p className="mt-2">{entry.description}</p>
          <p className="mt-2">
            <span className="text-ink">Period:</span> {periodLabel(entry.period)}.
          </p>
          <p className="mt-1">
            <span className="text-ink">Runs from:</span> {entry.runsFrom}
          </p>
          <p className="mt-2 text-[12.5px]">
            Source:{" "}
            <a
              href={entry.source.url}
              rel="noopener noreferrer"
              className="underline-draw text-ink"
            >
              {entry.source.name}
            </a>
          </p>
        </div>
      </div>

      <div aria-live="polite">
        <p className="label-mono text-indigo">Last day</p>
        {end ? (
          <>
            <p className="mt-3 font-display text-[2.2rem] font-semibold leading-tight text-ink">
              {FORMAT.format(end)}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
              {periodLabel(entry.period)} from {FORMAT.format(start!)}, with the day the time begins
              from left out. If the court is closed on that day, section 4 lets you file when it
              reopens.
            </p>
            {outer ? (
              <p className="mt-4 border-l border-ink/25 pl-4 text-[14px] leading-relaxed text-ink-soft">
                <span className="text-ink">Outer limit: {FORMAT.format(outer)}.</span> {entry.outer!.note}
              </p>
            ) : null}
            <div className="mt-5">
              <button type="button" onClick={copyLink} className="underline-draw text-[13.5px] text-ink">
                {copied ? "Link copied" : "Copy a link to this result"}
              </button>
              <p className="mt-1 text-[12px] text-ink-soft">
                The link contains the claim type and the date you entered.
              </p>
            </div>
          </>
        ) : (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Choose the claim and enter the date to see the last day.
          </p>
        )}

        <p className="mt-8 text-[13px] leading-relaxed text-ink-soft">
          This is the plain period only. It does not apply the sections that extend or exclude time
          (for example sections 5, 12, 14 and 18), or any special statute with its own period,
          such as the rules for commercial suits. Check the provision and those sections yourself
          before relying on a date.
        </p>
      </div>
    </div>
  );
}
