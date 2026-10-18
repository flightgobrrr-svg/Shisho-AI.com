import { Container } from "@/components/ui/Section";

/**
 * A thin band under the hero: the one thing on the page a visitor can try in
 * ten seconds. It is a plain GET form into /library/lookup, so it needs no
 * client JS. It looks a judgment up by case name — it does not verify an
 * AIR/SCC string, and the copy says so rather than promising that.
 */
export function LookupBand() {
  return (
    <section
      aria-label="Look up a judgment"
      className="border-y border-ink/10 bg-paper-raised py-8"
    >
      <Container>
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
          <div className="flex min-w-0 flex-1 gap-3">
            <input
              id="home-lookup"
              name="q"
              type="search"
              required
              maxLength={200}
              placeholder="Party A vs Party B"
              className="h-11 min-w-0 flex-1 rounded-seal border border-ink/45 bg-paper px-4 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-ink/80 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center rounded-seal border border-transparent bg-ink px-5 text-[14.5px] font-medium text-paper-raised transition-colors hover:bg-ink-soft"
            >
              Look up
            </button>
          </div>
        </form>
      </Container>
    </section>
  );
}
