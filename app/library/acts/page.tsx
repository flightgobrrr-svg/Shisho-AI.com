import type { Metadata } from "next";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { CENTRAL_ACTS, STATE_ACTS } from "@/lib/bareActs";

export const metadata: Metadata = {
  title: "Bare Acts",
  description:
    "An index of Central Acts and a curated, state-wise index of state legislation — names and years, not full text.",
};

export default function BareActsPage() {
  return (
    <>
      <Section className="!pb-12">
        <Container>
          <Eyebrow>Legal Library</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
            Central Acts, and state Acts <Emphasis>state-wise</Emphasis>.
          </h1>
          <p className="mt-5 max-w-[64ch] text-[16px] leading-relaxed text-ink-soft">
            An index — the name and year of an Act, not its text. The Central
            list is held to a high accuracy bar. The state list is
            deliberately not exhaustive: an entry appears only where the name
            and year are ones we&rsquo;re actually confident about, so some
            states show fewer entries than others rather than a padded,
            uncertain list. Always verify against the current bare act or
            state gazette before relying on anything here.
          </p>
        </Container>
      </Section>

      <Section id="central" tone="raised">
        <Container>
          <Eyebrow>{CENTRAL_ACTS.length} Central Acts</Eyebrow>
          {/* Columns, not a row-major grid: the list is alphabetical, so it
              reads down each column the way an index does. */}
          <ol className="mt-6 list-none gap-x-10 sm:columns-2 lg:columns-3">
            {CENTRAL_ACTS.map((act) => (
              <li key={act.sno} className={ACT_ROW}>
                <span className={ACT_NUMBER}>{act.sno}.</span>
                <span className="text-[14.5px] leading-relaxed text-ink">
                  {act.name}, {act.year}
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section id="states">
        <Container>
          <Eyebrow>{STATE_ACTS.length} states and union territories</Eyebrow>
          <h2 className="mt-4 font-display text-[1.4rem] font-semibold text-ink">
            State-wise index
          </h2>

          <nav aria-label="Jump to a state" className="mt-6">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13.5px]">
              {STATE_ACTS.map((group) => (
                <li key={group.state}>
                  <a
                    href={`#${stateId(group.state)}`}
                    className="underline-draw inline-flex min-h-6 items-center text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
                  >
                    {group.state}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 grid gap-x-14 gap-y-12 lg:grid-cols-2">
            {STATE_ACTS.map((group) => (
              <div key={group.state} id={stateId(group.state)} className="min-w-0">
                <h3 className="label-mono border-b border-ink/15 pb-2 text-indigo">
                  {group.state}
                </h3>
                {group.acts.length > 0 ? (
                  <ol className="mt-4 list-none">
                    {group.acts.map((act) => (
                      <li key={act.sno} className={ACT_ROW}>
                        <span className={ACT_NUMBER}>{act.sno}.</span>
                        <span className="text-[14.5px] leading-relaxed text-ink">
                          {act.name}, {act.year}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : null}
                {group.note ? (
                  <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-ink-soft">
                    {group.note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

/* A fixed, right-aligned number column so the names line up whether the
   number is one digit or two. */
const ACT_ROW = "flex break-inside-avoid items-baseline gap-2.5 py-1";
const ACT_NUMBER = "label-mono w-6 shrink-0 text-right text-ink-faint tabular-nums";

function stateId(state: string) {
  return `state-${state.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}
