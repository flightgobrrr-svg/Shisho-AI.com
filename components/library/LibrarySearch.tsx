"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { searchCases, slugify, topMatches, type PreviewCase } from "@/lib/library";
import { useDebouncedQuerySync } from "./useDebouncedQuerySync";

const MAX_SEARCH_RESULTS = 5;
/** Browse mode shows this many at a time. All 84 at once made the page
 *  over 20,000px tall on a phone, with the footer out of reach. */
const BROWSE_PAGE = 20;

/**
 * Live, client-side search over an already-scoped slice of ALL_CASES (court
 * + category filters are applied server-side in app/library/page.tsx before
 * this component ever sees the array). Filters on every keystroke — with a
 * few dozen entries this is an in-memory array scan, not worth debouncing
 * for its own sake.
 *
 * Typing a query switches the list from "browse everything" to "top
 * matches": capped to MAX_SEARCH_RESULTS and ranked by lib/library.ts's
 * topMatches, so a search never dumps a long, scroll-heavy list — the
 * browse state (no query) is still the uncapped full list, so every case
 * stays reachable via the category chips above this component.
 *
 * Every row is itself a link to that judgment's own journal-style brief
 * page (app/library/judgments/[slug]) — Read the judgment on Indian Kanoon
 * lives ON that page now, not on this row directly, since the brief page
 * is the richer landing spot and still surfaces that same external link
 * prominently.
 *
 * The URL's `q` param is still kept in sync (debounced, via router.replace)
 * so a search stays shareable/bookmarkable — but that's a background sync
 * for the link, not what drives the visible list. The list renders from
 * local state so typing never waits on a server round trip.
 */
export function LibrarySearch({
  cases,
  initialQuery,
  paramsWithoutQuery,
  activeLabel,
  emptyMessage,
}: {
  cases: PreviewCase[];
  initialQuery: string;
  /** e.g. "court=high-court" — everything but `q`, ready to append `q` to. */
  paramsWithoutQuery: string;
  activeLabel: string | null;
  emptyMessage: string | null;
}) {
  const [query, setQuery] = useDebouncedQuerySync(initialQuery, paramsWithoutQuery, "/library");
  const isSearching = query.trim().length > 0;

  const allMatches = useMemo(() => searchCases(cases, query), [cases, query]);
  const results = useMemo(
    () => (isSearching ? topMatches(cases, query, MAX_SEARCH_RESULTS) : allMatches),
    [cases, query, isSearching, allMatches],
  );
  const capped = isSearching && allMatches.length > MAX_SEARCH_RESULTS;

  /* How many browse rows are open. Tied to the case list it was opened for,
     so a new court or category filter starts again from the first page
     without a reset effect. */
  const [opened, setOpened] = useState({ for: cases, count: BROWSE_PAGE });
  const browseCount = opened.for === cases ? opened.count : BROWSE_PAGE;
  const visible = isSearching ? results : results.slice(0, browseCount);
  const remaining = results.length - visible.length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <label htmlFor="library-search" className="sr-only">
          Search the library
        </label>
        <input
          id="library-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Case name, citation, subject, or category…"
          className="h-11 min-w-0 grow basis-full border border-ink/45 bg-paper-raised px-4 text-[14.5px] text-ink placeholder:text-ink-faint sm:max-w-sm sm:basis-0"
        />
        <p className="label-mono text-ink-faint" aria-live="polite">
          {capped
            ? `Top ${MAX_SEARCH_RESULTS} of ${allMatches.length} matches`
            : `Showing ${visible.length} of ${cases.length}`}
        </p>
      </div>

      {results.length === 0 ? (
        /* An empty result that explains itself — same contract as the
           court-filter empty state this replaces: say why nothing is here
           rather than a generic "no match". */
        <div className="mt-12 max-w-[62ch] border-l-2 border-seal/70 pl-6">
          <p className="font-display text-[19px] leading-snug font-semibold text-ink">
            Nothing here yet.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            {emptyMessage ??
              (query
                ? `No landmark case matches "${query}"${activeLabel ? ` in ${activeLabel}` : ""}.`
                : "No landmark cases match this filter.")}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/library"
              className="underline-draw inline-block text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
            >
              Show everything
            </Link>
            {query ? (
              <Link
                href={`/library/lookup?q=${encodeURIComponent(query)}`}
                className="underline-draw inline-block text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
              >
                Look it up directly on Indian Kanoon →
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <ul className="reveal-stagger mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {visible.map((item, i) => (
              <li key={item.citation} style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={`/library/judgments/${slugify(item.title)}`}
                  className="group grid min-w-0 gap-2 px-1 py-6 transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:bg-paper sm:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] sm:items-baseline sm:gap-x-10"
                >
                  <div className="min-w-0">
                    <p className="font-display text-[18px] font-semibold text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] group-hover:text-ink-soft">
                      {item.title}
                    </p>
                    <p className="label-mono mt-1.5 text-indigo">{item.citation}</p>
                    <span className="underline-draw mt-2 hidden text-[13px] sm:inline-block text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] group-hover:text-ink">
                      Read the brief →
                    </span>
                  </div>
                  {/* Left-aligned, not ranged right: the summary runs to four or
                      five lines, and a ragged left edge on that much text is
                      hard to read down a long list. */}
                  <div className="min-w-0">
                    <p className="label-mono text-ink-faint">
                      {item.court} · {item.category}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                      {item.topic}
                    </p>
                  </div>
                  {/* On a phone the link closes the row, after the summary,
                      rather than sitting hard against the court label. */}
                  <span className="text-[13px] text-ink sm:hidden">Read the brief →</span>
                </Link>
              </li>
            ))}
          </ul>
          {remaining > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setOpened({ for: cases, count: browseCount + BROWSE_PAGE })}
                className="inline-flex h-11 items-center border border-ink/45 bg-paper-raised px-5 text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75"
              >
                Show {Math.min(BROWSE_PAGE, remaining)} more
              </button>
              <p className="text-[13px] text-ink-soft">{remaining} more in this list</p>
            </div>
          ) : null}
          {capped && (
            <p className="mt-4 text-[13px] text-ink-soft">
              Showing the {MAX_SEARCH_RESULTS} closest matches for &ldquo;{query}&rdquo; —
              keep typing to narrow it further.
            </p>
          )}
        </>
      )}
    </div>
  );
}
