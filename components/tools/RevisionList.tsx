"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  INTERVAL_DAYS,
  completeReview,
  parseCards,
  removeCard,
  revisionStore,
} from "@/lib/revision";

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function RevisionList() {
  const raw = useSyncExternalStore(
    revisionStore.subscribe,
    revisionStore.getSnapshot,
    revisionStore.getServerSnapshot,
  );
  const [open, setOpen] = useState<string | null>(null);
  // Fixed at first render: "due" is judged against when the page was opened.
  const [now] = useState(() => Date.now());

  if (raw === undefined) return <p className="text-[15px] text-ink-soft">Loading…</p>;
  const cards = parseCards(raw);

  const due = cards.filter((c) => c.stage < INTERVAL_DAYS.length && c.dueAt <= now);
  const waiting = cards.filter((c) => c.stage < INTERVAL_DAYS.length && c.dueAt > now);
  const done = cards.filter((c) => c.stage >= INTERVAL_DAYS.length);

  if (cards.length === 0) {
    return (
      <div className="max-w-xl rounded-seal border border-ink/20 bg-paper-raised p-6 md:p-7">
        <p className="font-display text-[19px] font-semibold text-ink">No briefs saved yet.</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Write a brief in case-brief practice and choose &ldquo;Save for
          revision&rdquo;. It comes back here after a day, a week and a month.
        </p>
        <Link
          href="/courses/case-brief"
          className="mt-5 inline-flex h-10 items-center rounded-seal border border-transparent bg-ink px-4 text-[14px] font-medium text-paper-raised transition-colors hover:bg-ink-soft"
        >
          Write a brief
        </Link>
      </div>
    );
  }

  const btn =
    "inline-flex h-9 items-center rounded-seal border px-3.5 text-[13.5px] font-medium transition-colors";

  return (
    <div className="max-w-2xl space-y-10">
      <p className="text-[14px] text-ink-soft">
        Briefs saved: {cards.length}. Reviews completed:{" "}
        {cards.reduce((n, c) => n + Math.min(c.stage, INTERVAL_DAYS.length), 0)}.
      </p>
      <section>
        <p className="label-mono text-indigo">Due now ({due.length})</p>
        {due.length === 0 ? (
          <p className="mt-3 text-[15px] text-ink-soft">Nothing is due. Come back later.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {due.map((c) => (
              <li key={c.id} className="rounded-seal border border-ink/20 bg-paper-raised p-5">
                <p className="font-display text-[17px] font-semibold text-ink">{c.title}</p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Review {c.stage + 1} of {INTERVAL_DAYS.length}. Recall the facts, issue, held and ratio
                  before you open your brief.
                </p>
                {open === c.id ? (
                  <dl className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-ink">
                    {(["facts", "issue", "held", "ratio"] as const).map((f) => (
                      <div key={f}>
                        <dt className="label-mono text-indigo">{f}</dt>
                        <dd className="mt-1 whitespace-pre-wrap">{c[f] || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(open === c.id ? null : c.id)}
                    className={`${btn} border-ink/45 text-ink hover:bg-ink/[0.04]`}
                  >
                    {open === c.id ? "Hide my brief" : "Show my brief"}
                  </button>
                  <button
                    type="button"
                    onClick={() => completeReview(c.id)}
                    className={`${btn} border-transparent bg-ink text-paper-raised hover:bg-ink-soft`}
                  >
                    I reviewed it
                  </button>
                  <Link
                    href={`/library/judgments/${c.slug}`}
                    target="_blank"
                    className={`${btn} border-ink/45 text-ink hover:bg-ink/[0.04]`}
                  >
                    Open the digest
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {waiting.length > 0 ? (
        <section>
          <p className="label-mono text-indigo">Coming up ({waiting.length})</p>
          <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
            {waiting.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between gap-4 py-3 text-[14.5px]">
                <span className="text-ink">{c.title}</span>
                <span className="shrink-0 text-ink-soft">{DATE.format(c.dueAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {done.length > 0 ? (
        <section>
          <p className="label-mono text-indigo">Finished ({done.length})</p>
          <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
            {done.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between gap-4 py-3 text-[14.5px]">
                <span className="text-ink">{c.title}</span>
                <button
                  type="button"
                  onClick={() => removeCard(c.id)}
                  className="underline-draw text-ink-soft"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
