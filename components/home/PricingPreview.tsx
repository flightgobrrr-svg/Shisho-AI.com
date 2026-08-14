import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { CountUp } from "@/components/motion/CountUp";
import { TIERS } from "@/lib/pricing";
import { cn } from "@/lib/cn";

/**
 * Pricing preview. The nav's "Pricing" link goes straight to /pricing now —
 * this section is a homepage teaser, not a navigation target, so it carries
 * no id of its own.
 *
 * Deliberately curated to the three headline tiers (Free, Core, Proficient)
 * rather than all four — Basic's ₹9 read-only pitch needs the context the
 * comparison table gives it, so it is left for /pricing rather than
 * competing for attention in a homepage skim. The ₹699 Draft Bot add-on lives
 * there too, for the same reason.
 *
 * Every figure comes from lib/pricing.ts. No price is written here.
 */
const PREVIEW_TIER_IDS = new Set(["free", "core", "proficient"]);

export function PricingPreview() {
  const preview = TIERS.filter((tier) => PREVIEW_TIER_IDS.has(tier.id));

  return (
    <Section tone="raised" className="border-y border-ink/10">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-title font-semibold">
              Priced for a student <Emphasis>budget</Emphasis>.
            </h2>
          </div>
          <Link
            href="/pricing"
            className="underline-draw text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
          >
            See the full comparison
          </Link>
        </div>

        <ul className="reveal-stagger mt-12 grid gap-6 md:grid-cols-3">
          {preview.map((tier, i) => (
            <li
              key={tier.id}
              style={{ "--i": i } as React.CSSProperties}
              className={cn(
                "flex min-w-0 flex-col rounded-seal border bg-paper p-7",
                "transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]",
                tier.popular
                  ? "border-seal/40 hover:border-seal/50"
                  : "border-ink/45 hover:border-ink/75",
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
