import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { slugify } from "@/lib/library";
import { searchKanoonTopResult } from "@/lib/indianKanoon";
import { getCaseDigestForUrl } from "@/lib/caseBrief";
import { DigestView } from "@/components/library/DigestView";

export const metadata: Metadata = {
  title: "Look up a judgment — Legal Library",
  description: "Look up any Indian judgment and get it as a citation digest, prepared from the real text.",
};

/**
 * A live, on-demand judgment lookup for anything outside the curated
 * Library's own list — the user's own explicit request: no pre-seeding, no
 * batch verification, Indian Kanoon is already the verified source, just
 * answer live when someone actually asks. `lib/indianKanoon.ts`'s
 * `searchKanoonTopResult` finds the real document; `getCaseDigestForUrl`
 * (lib/caseBrief.ts) converts it into the same digest format as the
 * curated Library, via components/library/DigestView.tsx.
 *
 * Plain GET form, no client JS: submitting navigates to
 * `/library/lookup?q=...`, which this same Server Component then handles —
 * matches /library's own `?q=`/`?category=` convention.
 *
 * The result streams in under its own Suspense boundary (keyed by the query,
 * so a new search shows the waiting state again) while the heading and the
 * form stay on screen. A route-level loading.tsx here made Next.js 16 answer
 * 404 for the page, the same family of fault as the retired root loading
 * file (HANDOFF.md), so the boundary lives in the page instead.
 */
export default async function LookupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16 md:py-24">
      <Link
        href="/library"
        className="underline-draw label-mono text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
      >
        Legal Library
      </Link>

      <h1 className="mt-5 font-display text-title font-semibold text-ink">
        Look up a judgment
      </h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-ink-soft">
        Not every judgment is in the curated Library yet. Search Indian Kanoon
        directly and Shisho will read the real judgment and prepare a citation
        digest from it, live. Phrase it the way a case is actually titled —
        &ldquo;Party A vs Party B&rdquo; — for the most reliable match.
      </p>

      <form method="GET" className="mt-8 flex flex-wrap gap-3">
        <label htmlFor="lookup-q" className="sr-only">
          Case name
        </label>
        <input
          id="lookup-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="e.g. Rangappa vs Sri Mohan"
          className="h-11 min-w-0 flex-1 border border-ink/45 bg-paper-raised px-4 text-[14.5px] text-ink placeholder:text-ink-faint"
        />
        <button
          type="submit"
          className="h-11 shrink-0 border border-transparent bg-seal px-5 text-[14.5px] font-medium text-paper-raised transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:bg-seal-dark"
        >
          Search
        </button>
      </form>

      {query ? (
        <Suspense key={query} fallback={<Finding />}>
          <LookupResult query={query} />
        </Suspense>
      ) : null}
    </div>
  );
}

/** What shows while the search runs and the digest is prepared. */
function Finding() {
  return (
    <div role="status" className="mt-14 flex flex-col items-center gap-4 py-16 text-center">
      <LogoMark className="rise size-12" />
      <p className="rise font-display text-[19px] font-semibold text-ink" style={{ animationDelay: "80ms" }}>
        Finding the judgment&hellip;
      </p>
      <p className="rise max-w-[46ch] text-[14.5px] leading-relaxed text-ink-soft" style={{ animationDelay: "140ms" }}>
        Shisho is searching for the judgment, then reading it to prepare a full citation digest. The first lookup of a
        judgment can take a few minutes.
      </p>
    </div>
  );
}

async function LookupResult({ query }: { query: string }) {
  const result = await searchKanoonTopResult(query);

  if (!result) {
    return (
      <div className="mt-10 max-w-[62ch] border-l-2 border-seal/70 pl-5">
        <p className="font-display text-[18px] font-semibold text-ink">No match found.</p>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
          Try phrasing it as Indian Kanoon titles the case itself — &ldquo;Party A
          vs Party B&rdquo; — rather than a general description.
        </p>
      </div>
    );
  }

  const slug = slugify(result.title);
  const digest = await getCaseDigestForUrl(
    { title: result.title, court: "", sourceUrl: result.url },
    slug,
  );

  return (
    <div className="mt-14 -mx-6 border-t border-ink/10">
      <DigestView
        title={result.title}
        citation={null}
        court={titleCase(digest.courtHeader)}
        digest={digest}
        sourceHref={result.url}
        sourceIsDirect
        backHref="/library/lookup"
        backLabel="Search again"
      />
    </div>
  );
}

/** `digest.courtHeader` is deterministically upper case for the bold header
 *  at the top of the digest — display-only fix so the "Court" field in the
 *  info grid below it doesn't just repeat the same all-caps text. */
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
