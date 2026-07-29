import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { CountUp } from "@/components/motion/CountUp";
import { TIERS } from "@/lib/pricing";
import { cn } from "@/lib/cn";

/**
 * Pricing preview. This is the target of the nav's `/#pricing` link.
 *
 * Deliberately shows only the three comparable tiers — the ₹699 Draft Bot
 * add-on lives on /courses, because it is a different kind of thing and would
 * make a three-way comparison a four-way muddle.
 *
 * Every figure comes from lib/pricing.ts. No price is written here.
 */
export function PricingPreview() {
  return (
    <Section id="pricing" tone="raised" className="border-y border-ink/10">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-title font-semibold">
              Priced for a student <Emphasis>budget</Emphasis>.
            </h2>
          </div>
          <Link
            href="/courses"
            className="underline-draw text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
          >
            See the full comparison
          </Link>
        </div>

        <ul className="reveal-stagger mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((tier, i) => (
            <li
              key={tier.id}
              style={{ "--i": i } as React.CSSProperties}
              className={cn(
                "flex min-w-0 flex-col rounded-seal border bg-paper p-7",
                tier.popular ? "border-seal/40" : "border-ink/10",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[19px] font-semibold text-ink">
                  {tier.name}
                </h3>
                {tier.popular ? (
                  <span className="label-mono shrink-0 text-seal">
                    Most popular
                  </span>
                ) : null}
              </div>

              <p className="mt-5">
                <CountUp
                  value={tier.price}
                  className="font-display text-[2.1rem] leading-none font-semibold whitespace-nowrap text-ink"
                />
                <span className="mt-1.5 block text-[13px] text-ink-soft">
                  {tier.price === 0 ? "forever" : "per month"}
                </span>
              </p>

              <p className="mt-5 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                {tier.tagline}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
