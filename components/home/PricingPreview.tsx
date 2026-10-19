import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { CountUp } from "@/components/motion/CountUp";
import { TIERS } from "@/lib/pricing";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/cn";

/**
 * Pricing preview. The nav's "Pricing" link goes straight to /pricing now —
 * this section is a homepage teaser, not a navigation target, so it carries
 * no id of its own.
 *
 * Shows all four tiers. This section previously curated down to three (Free,
 * Core, Proficient) on the theory that Basic's ₹9 pitch needed the comparison
 * table's context to make sense — but that hid the cheapest entry point from
 * anyone who only ever skims the homepage, which is the wrong trade. ₹9 is the
 * most persuasive number on the page; it belongs where people actually look.
 *
 * The ₹699 Draft Bot add-on is still left to /pricing: it is a different
 * purchase shape (an add-on, not a tier) and does not belong in a tier row.
 *
 * Layout matches PricingGrid on /pricing — one column, two from `md`, four
 * from `lg` — so the two pricing surfaces stay recognisably the same table.
 *
 * Every figure comes from lib/pricing.ts. No price is written here.
 */
export function PricingPreview({ locale = "en" }: { locale?: Locale }) {
  const preview = TIERS;
  const t = getDictionary(locale).pricingPreview;

  return (
    <Section tone="raised" className="border-y border-ink/10">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-title font-semibold">
              {t.heading.map((seg, i) =>
                seg.em ? <Emphasis key={i}>{seg.text}</Emphasis> : <span key={i}>{seg.text}</span>,
              )}
            </h2>
          </div>
          <Link
            href="/pricing"
            className="underline-draw text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
          >
            {t.seeFull}
          </Link>
        </div>

        <ul className="reveal-stagger mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              {/* The label sits above the name rather than beside it: at four
                  columns a card is too narrow for both on one line, and the
                  label ran out through the card's border. */}
              <div className="flex flex-col-reverse gap-1.5">
                <h3 className="font-display text-[19px] font-semibold text-ink">
                  {tier.name}
                </h3>
                {tier.popular ? (
                  <span className="label-mono text-seal">{t.mostPopular}</span>
                ) : (
                  <span aria-hidden="true" className="label-mono invisible hidden lg:block">
                    &nbsp;
                  </span>
                )}
              </div>

              <p className="mt-5">
                <CountUp
                  value={tier.price}
                  className="font-display text-[2.1rem] leading-none font-semibold whitespace-nowrap text-ink"
                />
                <span className="mt-1.5 block text-[13px] text-ink-soft">
                  {tier.price === 0 ? t.forever : t.perMonth}
                </span>
              </p>

              <p className="mt-5 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                {t.taglines[tier.id]}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
