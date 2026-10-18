import type { Metadata } from "next";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { LOG } from "@/lib/corrections";

export const metadata: Metadata = {
  title: "Corrections and known gaps",
  description:
    "What Shisho AI deliberately does not cover, and a record of any statement we have had to correct.",
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function CorrectionsPage() {
  const corrections = LOG.filter((e) => e.kind === "correction");
  const gaps = LOG.filter((e) => e.kind === "gap");

  return (
    <Section>
      <Container>
        <Eyebrow>Shisho AI</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          Corrections and known <Emphasis>gaps</Emphasis>.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          A legal tool is only as good as its edges. Here is what we leave out on purpose, and a
          record of anything we have had to correct.
        </p>

        <div className="mt-12 max-w-3xl">
          <Eyebrow>Corrections</Eyebrow>
          {corrections.length === 0 ? (
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              None yet. When a published statement turns out to be wrong, it is listed here with the
              date, what was wrong and what it says now.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {corrections.map((e) => (
                <Entry key={e.title} entry={e} />
              ))}
            </ul>
          )}

          <Eyebrow className="mt-14">Known gaps</Eyebrow>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {gaps.map((e) => (
              <Entry key={e.title} entry={e} />
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

function Entry({ entry }: { entry: (typeof LOG)[number] }) {
  return (
    <li className="py-5">
      <p className="label-mono text-ink-faint">{DATE.format(new Date(entry.date))}</p>
      <p className="mt-2 font-display text-[17px] font-semibold text-ink">{entry.title}</p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{entry.body}</p>
    </li>
  );
}
