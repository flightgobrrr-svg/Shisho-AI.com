import Link from "next/link";
import { Container } from "@/components/ui/Section";

/**
 * A thin band under the hero: the one thing on the page a visitor can try in
 * ten seconds. It is a plain GET form into /library/lookup, so it needs no
 * client JS. It looks a judgment up by case name — it does not verify an
 * AIR/SCC string, and the copy says so rather than promising that.
 *
 * It is a framed panel on the page's own paper, not a full-width strip. As a
 * strip with its own background it butted straight onto the hero's foot and
 * sliced the photograph's fade off with a hard line, so the hero looked cut
 * short and the band looked stuck on. On the same paper the hero dissolves
 * into empty space first, and the panel reads as the next thing on the page.
 */
export function LookupBand() {
  return (
    <section
      aria-label="Look up a judgment"
      className="pt-4 pb-16 md:pt-6 md:pb-20"
    >
      <Container>
        <div className="rounded-seal border border-ink/20 bg-paper-raised p-5 shadow-[0_1px_2px_rgba(34,37,43,0.04),0_18px_40px_-24px_rgba(34,37,43,0.22)] sm:p-6 md:p-8">
          <form
            method="GET"
            action="/library/lookup"
            className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8"
          >
            <div className="md:w-[22rem] md:shrink-0">
              <label
                htmlFor="home-lookup"
                className="font-display text-[19px] font-semibold text-ink"
              >
                Look up a judgment
              </label>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                Type a case name, like &ldquo;Kesavananda Bharati vs State of
                Kerala&rdquo;, and read a digest prepared from the real text.
              </p>
            </div>
            <div className="flex min-w-0 flex-1 gap-2 sm:gap-3">
              <input
                id="home-lookup"
                name="q"
                type="search"
                required
                maxLength={200}
                placeholder="Party A vs Party B"
                className="h-11 min-w-0 flex-1 rounded-seal border border-ink/45 bg-paper px-3 text-[15px] sm:px-4 text-ink placeholder:text-ink-faint focus:border-ink/80"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center rounded-seal border border-transparent bg-ink px-4 text-[14.5px] sm:px-5 font-medium text-paper-raised transition-colors hover:bg-ink-soft"
              >
                Look up
              </button>
            </div>
          </form>

          <form
            method="GET"
            action="/library"
            className="mt-6 flex flex-col gap-4 border-t border-ink/10 pt-6 md:flex-row md:items-center md:gap-8"
          >
            <input type="hidden" name="collection" value="acts" />
            <div className="md:w-[22rem] md:shrink-0">
              <label
                htmlFor="home-provision"
                className="font-display text-[19px] font-semibold text-ink"
              >
                Find a provision
              </label>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                Search the Bare Acts section by section, for example
                &ldquo;Order VII Rule 11&rdquo;.
              </p>
            </div>
            <div className="flex min-w-0 flex-1 gap-2 sm:gap-3">
              <input
                id="home-provision"
                name="q"
                type="search"
                required
                maxLength={100}
                placeholder="Section, Order or Article"
                className="h-11 min-w-0 flex-1 rounded-seal border border-ink/45 bg-paper px-3 text-[15px] sm:px-4 text-ink placeholder:text-ink-faint focus:border-ink/80"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center rounded-seal border border-ink/45 px-4 text-[14.5px] font-medium text-ink sm:px-5 transition-colors hover:bg-ink/[0.04]"
              >
                Find
              </button>
            </div>
          </form>
          <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-ink-soft">
            <span className="label-mono text-ink-faint">Or try</span>
            <Link href="/limitation" className="underline-draw text-ink">
              Check a limitation date
            </Link>
            <Link href="/ipc-bns" className="underline-draw text-ink">
              IPC to BNS
            </Link>
            <Link
              href="/draft-bot?mode=review#review"
              className="underline-draw text-ink"
            >
              Mark my draft
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
