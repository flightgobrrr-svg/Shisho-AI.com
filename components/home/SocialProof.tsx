import { Container, Eyebrow, Section } from "@/components/ui/Section";

/*
  ⚠️ PLACEHOLDER DATA — NOT REAL CLAIMS.

  Shisho AI has no users yet, so every number and quote below is deliberately
  left as an obvious blank. The layout, type scale, and spacing are
  production-ready; the content is not, and is written so it cannot ship by
  accident or survive a screenshot.

  TODO before launch: replace with verified figures and quotes you have
  written permission to publish. Do not invent either — a fabricated stat on a
  legal-education product is a real credibility and advertising-standards
  problem, not a placeholder concern.
*/

const STATS = [
  { value: "—", label: "Judgments in the library" },
  { value: "—", label: "Drafts reviewed" },
  { value: "—", label: "Students enrolled" },
];

/*
  The institution band adapted from the supplied block's "Meet Our Customers"
  logo grid. The original shipped real Nvidia / GitHub / Nike / OpenAI /
  Laravel / Lilly marks — on this product those would assert customer
  relationships that do not exist, and they are trademarks besides. Same grid
  rhythm, honest contents.

  TODO before launch: replace with institutions that have actually agreed to
  be named, and use their marks only with permission.
*/
const INSTITUTIONS = [
  "[Partner institution]",
  "[Partner institution]",
  "[Law school]",
  "[Law school]",
  "[Bar association]",
  "[Legal aid clinic]",
];

const TESTIMONIALS = [
  {
    quote:
      "[Quote goes here — one or two sentences, in their own words, about what specifically changed for them.]",
    name: "[Name]",
    detail: "[Year], [Law School]",
  },
  {
    quote:
      "[Quote goes here — ideally from a practising advocate, naming the kind of drafting it helped with.]",
    name: "[Name]",
    detail: "[Advocate, City]",
  },
  {
    quote:
      "[Quote goes here — from someone who started with no legal background.]",
    name: "[Name]",
    detail: "[Role, City]",
  },
];

export function SocialProof() {
  return (
    <Section>
      <Container>
        <Eyebrow>Placeholder — pending real data</Eyebrow>

        <dl className="mt-8 grid gap-8 border-b border-ink/10 pb-12 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-[2.5rem] leading-none font-semibold text-ink/30 tabular-nums">
                  {stat.value}
                </span>
                <span className="mt-3 block text-[14px] text-ink-soft">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <li key={i} className="min-w-0">
              <figure>
                <blockquote className="text-[15px] leading-relaxed text-ink-soft/70 italic">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-4 text-[13px] text-ink-soft/70">
                  <span className="block font-medium text-ink/60">
                    {testimonial.name}
                  </span>
                  <span className="label-mono mt-1 block text-ink-soft/50">
                    {testimonial.detail}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-16 border-t border-ink/10 pt-12">
          <p className="label-mono text-center text-ink-soft/50">
            Taught and used at
          </p>
          <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
            {INSTITUTIONS.map((name, i) => (
              <li
                key={i}
                className="flex min-w-0 items-center justify-center rounded-seal border border-dashed border-ink/15 px-3 py-4"
              >
                <span className="label-mono text-center text-ink-soft/40">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
