import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { StageTrail } from "@/components/map/StageTrail";
import { LibrarySearch } from "@/components/library/LibrarySearch";
import { ProvisionSearch } from "@/components/library/ProvisionSearch";
import {
  CATEGORIES,
  COLLECTIONS,
  COURT_FILTERS,
  PREVIEW_CASES,
  isCategory,
  isCollectionId,
  isCourtFilter,
} from "@/lib/library";
import { PROVISIONS } from "@/lib/acts";
import { fetchVerifiedCases } from "@/lib/verifiedCases";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Legal Library",
  description:
    "Supreme Court and High Court judgments, bare acts, and commentary — searchable and explained in plain language.",
};

const ACTS_IN_USE = new Set(PROVISIONS.map((p) => p.actId)).size;

/**
 * Accepts `?court=` and `?collection=` so the map's six Library boxes land
 * somewhere that reflects their label instead of all arriving at one page.
 * An unrecognised value is ignored rather than erroring — a bad query should
 * degrade to the full Library, not a 404.
 */
export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    court?: string;
    collection?: string;
    category?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const court = isCourtFilter(params.court) ? params.court : null;
  const collection = isCollectionId(params.collection) ? params.collection : null;
  const category = isCategory(params.category) ? params.category : null;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const filter = court ? COURT_FILTERS[court] : null;

  // The static 31 (lib/library.ts) plus whatever the review queue has
  // actually verified in Supabase — see lib/verifiedCases.ts for why this
  // fails soft to [] rather than ever taking the page down.
  const verifiedFromSupabase = await fetchVerifiedCases();
  const ALL_CASES = [...PREVIEW_CASES, ...verifiedFromSupabase];

  const byCourtFilter = filter ? ALL_CASES.filter(filter.test) : ALL_CASES;
  const scopedCases = category
    ? byCourtFilter.filter((c) => c.category === category)
    : byCourtFilter;
  const activeLabel =
    filter?.label ?? COLLECTIONS.find((c) => c.id === collection)?.name ?? null;
  const landmarksActiveLabel = [filter?.label, category].filter(Boolean).join(" · ") || null;

  const view = collection === "acts" || collection === "commentary" ? collection : "judgments";

  /** Preserves every other active filter while a Link overrides one. */
  function libraryHref(overrides: { category?: string | null }) {
    const p = new URLSearchParams();
    if (court) p.set("court", court);
    if (collection) p.set("collection", collection);
    if (query) p.set("q", query);
    const nextCategory = "category" in overrides ? overrides.category : category;
    if (nextCategory) p.set("category", nextCategory);
    const qs = p.toString();
    return qs ? `/library?${qs}` : "/library";
  }

  /** Switches which collection is showing, preserving court/query but
   *  dropping the case-only category filter unless staying on judgments. */
  function collectionHref(id: string | null) {
    const p = new URLSearchParams();
    if (court) p.set("court", court);
    if (id) p.set("collection", id);
    if (query) p.set("q", query);
    if (category && (!id || id === "judgments")) p.set("category", category);
    const qs = p.toString();
    return `${qs ? `/library?${qs}` : "/library"}#content`;
  }

  function chipClasses(active: boolean) {
    return cn(
      "label-mono inline-flex min-h-9 shrink-0 items-center border px-3.5 text-[12.5px] whitespace-nowrap transition-colors",
      "duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
      active
        ? "border-ink bg-ink text-paper-raised"
        : "border-ink/45 text-ink-soft hover:border-ink/75 hover:text-ink",
    );
  }

  return (
    <>
      <Section>
        <Container>
          <Eyebrow>Legal Library</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title md:text-display">
            The <Emphasis>authorities</Emphasis>, explained.
          </h1>
          <StageTrail product="library" className="mt-6" />
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft">
            Supreme Court and High Court judgments, bare acts, and commentary —
            correctly cited and explained in plain language. Search any of
            the three below, or jump straight to a collection; each judgment
            links to Indian Kanoon to help you find the full text.
          </p>

          {activeLabel && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="label-mono text-ink-soft">Showing</span>
              <span className="flex min-h-11 items-center border border-ink/45 bg-paper-raised px-4 text-[14.5px] text-ink">
                {activeLabel}
              </span>
              <Link
                href="/library"
                className="underline-draw flex min-h-11 items-center text-[14px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
              >
                Show everything
              </Link>
            </div>
          )}
        </Container>
      </Section>

      <Section id="collections" tone="raised" className="!pt-0">
        <Container>
          <h2 className="font-display text-[22px] font-semibold text-ink">Three collections</h2>
          <ul className="reveal-stagger mt-10 grid gap-6 md:grid-cols-3">
            {COLLECTIONS.map((c, i) => {
              const stat =
                c.id === "judgments"
                  ? `${ALL_CASES.length} judgments`
                  : c.id === "acts"
                    ? `${PROVISIONS.length} provisions · ${ACTS_IN_USE} Acts`
                    : `${PROVISIONS.length} notes`;
              return (
                <li key={c.id} style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={collectionHref(c.id)}
                    scroll={false}
                    className={cn(
                      "flex h-full min-w-0 flex-col rounded-seal border p-7",
                      "transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                      "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]",
                      view === c.id
                        ? "border-ink/75 bg-paper-raised shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]"
                        : "border-ink/45 bg-paper-raised hover:border-ink/75",
                    )}
                  >
                    <span className="label-mono text-indigo">{stat}</span>
                    <h3 className="mt-4 font-display text-[20px] font-semibold text-ink">
                      {c.name}
                    </h3>
                    <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                      {c.description}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      <Section id="content">
        <Container>
          {view === "judgments" && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Eyebrow>Landmark cases</Eyebrow>
                  <h2 className="mt-4 max-w-xl font-display text-title font-semibold">
                    Starting with the judgments every student <Emphasis>knows</Emphasis>.
                  </h2>
                </div>
                <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink-soft">
                  Subject and subsequent history, flagged where a judgment is no
                  longer good law — not a substitute for reading the full report.
                </p>
              </div>

              {byCourtFilter.length > 0 && (
                /* One scrolling row on a phone, where six long mono labels
                   stacked into a wall; wrapping from sm up. */
                <div className="-mx-6 mt-8 flex scroll-px-6 gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  <Link
                    href={libraryHref({ category: null })}
                    scroll={false}
                    className={chipClasses(!category)}
                  >
                    All ({byCourtFilter.length})
                  </Link>
                  {CATEGORIES.map((cat) => {
                    const count = byCourtFilter.filter((c) => c.category === cat).length;
                    if (count === 0) return null;
                    return (
                      <Link
                        key={cat}
                        href={libraryHref({ category: cat })}
                        scroll={false}
                        className={chipClasses(category === cat)}
                      >
                        {cat} ({count})
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-8">
                <LibrarySearch
                  cases={scopedCases}
                  initialQuery={query}
                  paramsWithoutQuery={new URLSearchParams({
                    ...(court ? { court } : {}),
                    ...(collection ? { collection } : {}),
                    ...(category ? { category } : {}),
                  }).toString()}
                  activeLabel={landmarksActiveLabel}
                  emptyMessage={filter?.empty ?? null}
                />
              </div>
            </>
          )}

          {view === "acts" && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Eyebrow>Bare Acts</Eyebrow>
                  <h2 className="mt-4 max-w-xl font-display text-title font-semibold">
                    The provisions Shisho is <Emphasis>built on</Emphasis>.
                  </h2>
                </div>
                <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink-soft">
                  Stated plainly, section by section — not the full text of
                  any Act, but every provision this product actually cites.
                </p>
              </div>
              <div className="mt-8">
                <ProvisionSearch
                  provisions={PROVISIONS}
                  initialQuery={query}
                  paramsWithoutQuery={new URLSearchParams({ collection: "acts" }).toString()}
                  mode="acts"
                />
              </div>
            </>
          )}

          {view === "commentary" && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <Eyebrow>Commentary</Eyebrow>
                  <h2 className="mt-4 max-w-xl font-display text-title font-semibold">
                    How each provision actually <Emphasis>plays out</Emphasis>.
                  </h2>
                </div>
                <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink-soft">
                  Tied to the cases that interpret it — including where the
                  Bharatiya Nyaya Sanhita carried a repealed provision
                  forward, and where it didn&rsquo;t.
                </p>
              </div>
              <div className="mt-8">
                <ProvisionSearch
                  provisions={PROVISIONS}
                  initialQuery={query}
                  paramsWithoutQuery={new URLSearchParams({ collection: "commentary" }).toString()}
                  mode="commentary"
                />
              </div>
            </>
          )}
        </Container>
      </Section>

      <Section tone="raised">
        <Container className="text-center">
          <h2 className="mx-auto max-w-xl font-display text-title font-semibold">
            Read while the library is being <Emphasis>built</Emphasis>.
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[15.5px] leading-relaxed text-ink-soft">
            Try Shisho on a sample writ petition, or start a course track
            — both cite the same authorities the library will index.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Button href="/draft-bot" size="lg">
                Try Shisho
              </Button>
            </Magnetic>
            <Button href="/courses" variant="ghost" size="lg">
              Browse courses
            </Button>
          </div>
          <p className="mt-6 text-[13.5px] text-ink-soft">
            Search covers what&rsquo;s here today — more citations are still
            on the way. Full judgment text isn&rsquo;t hosted here yet; every
            entry links to Indian Kanoon to help you find it there.
          </p>
        </Container>
      </Section>
    </>
  );
}
