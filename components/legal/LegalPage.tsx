import { Container, Eyebrow, Section } from "@/components/ui/Section";
import type { LegalDoc } from "@/lib/legalPages";

/** One plain reading column: title, lede, then ruled sections. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <Section>
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{doc.updated ? `Updated ${doc.updated}` : "Shisho AI"}</Eyebrow>
          <h1 className="mt-4 font-display text-title font-semibold">{doc.title}</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">{doc.lede}</p>

          <div className="mt-12 divide-y divide-ink/10 border-t border-ink/10">
            {doc.sections.map((section) => (
              <section key={section.heading} className="py-8">
                <h2 className="font-display text-[1.25rem] font-semibold text-ink">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-soft">
                  {section.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
