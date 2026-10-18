"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getAct, searchProvisions, type Provision } from "@/lib/acts";
import { DOCUMENTS } from "@/lib/documents";
import { PREVIEW_CASES } from "@/lib/library";
import { useDebouncedQuerySync } from "./useDebouncedQuerySync";

const documentNameBySlug = new Map(DOCUMENTS.map((d) => [d.slug, d.name]));
const caseTitleByCitation = new Map(PREVIEW_CASES.map((c) => [c.citation, c.title]));

/**
 * Live search over PROVISIONS (lib/acts.ts), grouped by Act — the shared
 * data behind both the "Bare Acts" and "Commentary" collections. `mode`
 * picks which facet of each entry is the headline text (the operative rule,
 * or the practical note); everything else — grouping, search, cross-links to
 * the pleading and case each provision actually appears in — is identical,
 * because it's the same 39 entries either way.
 */
export function ProvisionSearch({
  provisions,
  initialQuery,
  paramsWithoutQuery,
  mode,
}: {
  provisions: Provision[];
  initialQuery: string;
  paramsWithoutQuery: string;
  mode: "acts" | "commentary";
}) {
  const [query, setQuery] = useDebouncedQuerySync(initialQuery, paramsWithoutQuery, "/library");

  const results = useMemo(() => searchProvisions(provisions, query), [provisions, query]);

  const groups = useMemo(() => {
    const seen: string[] = [];
    for (const p of results) if (!seen.includes(p.actId)) seen.push(p.actId);
    return seen.map((actId) => ({
      act: getAct(actId as Provision["actId"]),
      items: results.filter((p) => p.actId === actId),
    }));
  }, [results]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <label htmlFor={`provision-search-${mode}`} className="sr-only">
          Search {mode === "acts" ? "the bare acts" : "the commentary"}
        </label>
        <input
          id={`provision-search-${mode}`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Act, section, or subject…"
          className="h-11 min-w-0 flex-1 border border-ink/45 bg-paper-raised px-4 text-[14.5px] text-ink placeholder:text-ink-soft/60 sm:max-w-sm"
        />
        <p className="label-mono text-ink-soft/70" aria-live="polite">
          Showing {results.length} of {provisions.length}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-12 max-w-[62ch] border-l-2 border-seal/70 pl-6">
          <p className="font-display text-[19px] leading-snug font-semibold text-ink">
            Nothing here yet.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            No provision matches &ldquo;{query}&rdquo;.
          </p>
          <Link
            href="/library"
            className="underline-draw mt-5 inline-block text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
          >
            Show everything
          </Link>
        </div>
      ) : (
        <div className="mt-12 space-y-12">
          {groups.map(({ act, items }) => (
            <div key={act.id}>
              <h3 className="flex flex-wrap items-baseline gap-3 font-display text-[18px] font-semibold text-ink">
                {act.name}
                {!act.inForce && (
                  <span className="label-mono rounded-seal border border-seal/50 px-2 py-0.5 text-[11px] text-seal">
                    Repealed
                  </span>
                )}
              </h3>
              <ul className="reveal-stagger mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {items.map((p, i) => (
                  <li
                    key={`${p.actId}-${p.section}`}
                    style={{ "--i": i } as React.CSSProperties}
                    className="py-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                      <p className="font-display text-[16px] font-semibold text-ink">
                        {p.section}
                        <span className="text-ink-soft"> — {p.title}</span>
                      </p>
                      {!p.verbatim && (
                        <span className="label-mono text-[11px] text-ink-soft/50">
                          plain-language summary
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-[15px] leading-relaxed text-ink">
                      {mode === "acts" ? p.text : p.commentary}
                    </p>

                    {p.successor?.kind === "none" && (
                      <p className="mt-3 text-[13.5px] leading-relaxed text-seal">
                        No successor provision — {p.successor.note}
                      </p>
                    )}

                    {((p.usedIn && p.usedIn.length > 0) || (p.citedIn && p.citedIn.length > 0)) && (
                      <p className="mt-3 space-x-1 text-[13px] leading-relaxed text-ink-soft/70">
                        {p.usedIn && p.usedIn.length > 0 && (
                          <span>
                            Used by{" "}
                            {p.usedIn.map((slug, idx) => (
                              <span key={slug}>
                                <Link
                                  href={`/documents/${slug}`}
                                  className="underline-draw text-ink-soft"
                                >
                                  {documentNameBySlug.get(slug) ?? slug}
                                </Link>
                                {idx < p.usedIn!.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        )}
                        {p.usedIn && p.usedIn.length > 0 && p.citedIn && p.citedIn.length > 0
                          ? " · "
                          : ""}
                        {p.citedIn && p.citedIn.length > 0 && (
                          <span>
                            Cited in{" "}
                            {p.citedIn.map((citation, idx) => (
                              <span key={citation}>
                                <Link
                                  href={`/library?q=${encodeURIComponent(citation)}`}
                                  className="underline-draw text-ink-soft"
                                >
                                  {caseTitleByCitation.get(citation) ?? citation}
                                </Link>
                                {idx < p.citedIn!.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        )}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
