import type { Metadata } from "next";
import { PricingGrid } from "@/components/pricing/PricingGrid";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Plans from ₹9 a month — Free, Basic, Core, and Proficient, plus a standalone Draft Bot add-on. Full feature breakdown.",
};

const FAQS = [
  {
    q: "What do I actually get for ₹9?",
    a: "Basic unlocks the full Starter course and the full Legal Library — everything Free only previews. The Draft Bot itself stays at the same 5 reviews a month as Free; unlimited reviews start at Core.",
  },
  {
    q: "Can I cancel?",
    a: "Yes — every plan is monthly and can be cancelled at any time. Access continues to the end of the billing month.",
  },
  {
    q: "I only want the Draft Bot, not the courses. Do I have to buy Core?",
    a: "No — the ₹699 add-on below buys the Draft Bot on its own, unlimited, without either course.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Section>
        <Container>
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-[2.05rem] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[2.6rem] lg:text-display">
            Priced for a student <Emphasis>budget</Emphasis>.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[16.5px] leading-relaxed text-ink-soft md:text-[17.5px]">
            All prices in Indian rupees, billed monthly. Cancel any time. Four
            plans, from a ₹9 entry price to unlimited, citation-checked drafting
            review.
          </p>
        </Container>
      </Section>

      <Section tone="raised" className="border-y border-ink/10 !pt-0">
        <Container>
          <PricingGrid />
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>Compare</Eyebrow>
          <h2 className="mt-4 max-w-xl font-display text-title font-semibold">
            Every plan, feature by <Emphasis>feature</Emphasis>.
          </h2>

          <div className="mt-10">
            <ComparisonTable />
          </div>
        </Container>
      </Section>

      <Section tone="raised" className="border-t border-ink/10">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-4 font-display text-title font-semibold">
                Before you <Emphasis>subscribe</Emphasis>.
              </h2>
            </div>

            <dl className="space-y-8">
              {FAQS.map((faq) => (
                <div key={faq.q} className="min-w-0">
                  <dt className="font-display text-[18px] font-semibold text-ink">
                    {faq.q}
                  </dt>
                  <dd className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Container className="mt-16 px-0 text-center md:px-0">
            <Magnetic>
              <Button href="/draft-bot" size="lg">
                Try the Draft Bot free
              </Button>
            </Magnetic>
          </Container>
        </Container>
      </Section>
    </>
  );
}
