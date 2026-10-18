"use client";

import { useState } from "react";

/** RFC 5545 text escaping: backslash, semicolon, comma and newlines. */
function esc(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function buildIcs(title: string, date: string, note: string) {
  const day = date.replaceAll("-", "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shisho AI//Next date//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@shisho`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `SUMMARY:${esc(title)}`,
    ...(note ? [`DESCRIPTION:${esc(note)}`] : []),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/**
 * Builds a calendar file on the device and downloads it. Nothing is sent
 * anywhere, and the file carries a one-day-before alert, so a next date lands
 * in the clerk's own calendar instead of a paper diary.
 */
export function NextDateReminder() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const ready = title.trim() !== "" && date !== "";
  const input =
    "mt-2 h-11 w-full rounded-seal border border-ink/45 bg-paper px-3 text-[15px] text-ink focus:border-ink/80 focus:outline-none";

  function download() {
    const blob = new Blob([buildIcs(title.trim(), date, note.trim())], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "next-date.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <label htmlFor="nd-title" className="label-mono text-indigo">
          Case and purpose
        </label>
        <input
          id="nd-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="O.S. 123/2025 — evidence"
          className={input}
        />
      </div>
      <div>
        <label htmlFor="nd-date" className="label-mono text-indigo">
          Next date
        </label>
        <input
          id="nd-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="nd-note" className="label-mono text-indigo">
          Note (optional)
        </label>
        <input
          id="nd-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Court, item number, what to bring"
          className={input}
        />
      </div>
      <button
        type="button"
        onClick={download}
        disabled={!ready}
        className="inline-flex h-11 items-center rounded-seal border border-transparent bg-ink px-5 text-[14.5px] font-medium text-paper-raised transition-colors hover:bg-ink-soft disabled:opacity-45"
      >
        Download calendar file
      </button>
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Opens in Google Calendar, Outlook or Apple Calendar, with an alert the
        day before. Nothing is sent to Shisho.
      </p>
    </div>
  );
}
