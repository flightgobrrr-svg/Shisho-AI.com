import type { Metadata } from "next";
import { MootTimer } from "@/components/tools/MootTimer";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Moot kit",
  description:
    "The parts of a moot memorial, a checklist for the oral round, and a timer to rehearse against.",
};

const MEMORIAL = [
  ["Cover page", "Court, case number, parties, and the side you appear for."],
  ["Table of contents", "Every heading below, with page numbers."],
  ["Index of authorities", "Cases, statutes and books relied on, each with its citation."],
  ["Statement of jurisdiction", "The provision under which the court can hear the matter."],
  ["Statement of facts", "Only the facts in the moot problem, in order, without argument."],
  ["Issues raised", "The questions the court must decide, framed in your side's favour."],
  ["Summary of arguments", "One short paragraph per issue: your answer and why."],
  ["Arguments advanced", "Each issue in full: rule, authority, application to the facts."],
  ["Prayer", "Exactly what you ask the court to hold or order."],
];

const ORAL = [
  "Open with your name, your side and what you ask for.",
  "Say how many issues you will take, and in what order.",
  "For each issue: the rule, the authority, then the facts.",
  "Answer the bench's question when it is asked, then return to your point.",
  "Keep the pinpoint page for every case you cite.",
  "Leave a minute for the prayer, and read it out.",
];

export default function MootPage() {
  return (
    <>
      <Section className="!pb-12">
        <Container>
          <Eyebrow>For law students</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
            Moot <Emphasis>kit</Emphasis>.
          </h1>
          <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
            The usual parts of a memorial, a short checklist for the oral round,
            and a timer. Your moot rules come first: check them for the required
            order and page limits.
          </p>
        </Container>
      </Section>

      <Section tone="raised" className="border-y border-ink/10 !py-14">
        <Container>
          <Eyebrow>The memorial</Eyebrow>
          <ol className="mt-6 grid gap-x-12 gap-y-5 md:grid-cols-2">
            {MEMORIAL.map(([name, note], i) => (
              <li key={name} className="flex gap-4">
                <span className="label-mono mt-1 shrink-0 text-ink-soft/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-display text-[17px] font-semibold text-ink">
                    {name}
                  </span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-ink-soft">
                    {note}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="!py-14">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>The oral round</Eyebrow>
              <ul className="mt-6 space-y-3 text-[15px] leading-relaxed text-ink-soft">
                {ORAL.map((line) => (
                  <li key={line} className="border-l border-ink/25 pl-5">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <MootTimer />
          </div>
        </Container>
      </Section>
    </>
  );
}
