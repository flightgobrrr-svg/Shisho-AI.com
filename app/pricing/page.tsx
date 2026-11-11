import type { Metadata } from "next";
import { PRICING_FAQS, PRICING_INTRO } from "@/lib/pricing";
import { PricingGrid } from "@/components/pricing/PricingGrid";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Plans from ₹9 a month — Free, Basic, Core, and Proficient, plus a standalone Shisho add-on. Full feature breakdown.",
};


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
            {PRICING_INTRO}
          </p>
        </Container>
      </Section>

      <Section id="plans" tone="raised" className="!pt-0">
        <Container>
          <PricingGrid />
        </Container>
      </Section>

      <Section id="compare">
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

      <Section tone="raised">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-4 font-display text-title font-semibold">
                Before you <Emphasis>subscribe</Emphasis>.
              </h2>
            </div>

            <dl className="space-y-8">
              {PRICING_FAQS.map((faq) => (
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
                Try Shisho free
              </Button>
            </Magnetic>
          </Container>
        </Container>
      </Section>
    </>
  );
}
