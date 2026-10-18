import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/motion/CountUp";
import { ADD_ON, formatINR, TIERS } from "@/lib/pricing";
import { cn } from "@/lib/cn";

/**
 * The full four-tier comparison, plus the add-on band.
 *
 * Mobile overflow is an explicit requirement, so it is guarded three ways:
 *   - the grid collapses to one full-width column below `md`, two from `md`,
 *     and all four only from `lg`, where there is room for them;
 *   - every grid child carries `min-w-0`, so no long string can force the
 *     track wider than the viewport;
 *   - the price is `whitespace-nowrap` with the "per month" suffix on its own
 *     line, rather than trailing the figure where it would be the first thing
 *     to wrap awkwardly.
 * ₹999 is the widest value; verified at 320px.
 *
 * Seal budget on this page: the "Recommended for students" badge, the Core CTA, and the
 * Emphasis underlines. Nothing else. Feature checks are ink-soft on purpose.
 */

function Price({ amount }: { amount: number }) {
  return (
    <p className="mt-5">
      <CountUp
        value={amount}
        className="font-display text-[2.25rem] leading-none font-semibold whitespace-nowrap text-ink sm:text-[2.5rem]"
      />
      <span className="mt-2 block text-[13px] text-ink-soft">
        {amount === 0 ? "forever" : "per month"}
      </span>
    </p>
  );
}

export function PricingGrid() {
  return (
    <>
      <ul className="reveal-stagger grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier, i) => (
          <li
            key={tier.id}
            className="min-w-0"
            style={{ "--i": i } as React.CSSProperties}
          >
            <div
              className={cn(
                "relative flex h-full flex-col rounded-seal border bg-paper-raised p-7",
                "transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]",
                tier.popular
                  ? "border-seal/40"
                  : "border-ink/45 hover:border-ink/75",
              )}
            >
              {tier.popular ? (
                <span className="label-mono absolute -top-2.5 left-7 bg-paper-raised px-2 text-seal">
                  Recommended for students
                </span>
              ) : null}

              <h2 className="font-display text-[20px] font-semibold text-ink">
                {tier.name}
              </h2>

              <Price amount={tier.price} />

              <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
                {tier.tagline}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5 border-t border-ink/10 pt-6">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft"
                  >
                    <span aria-hidden="true" className="mt-px text-ink-faint">
                      &#10003;
                    </span>
                    <span className="min-w-0">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                href={tier.cta.href}
                variant={tier.popular ? "primary" : "ghost"}
                className="mt-7 w-full"
              >
                {tier.cta.label}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* The add-on is not a fifth tier — it is a different kind of thing,
          so it sits outside the comparison rather than inside it. */}
      <div className="mt-8 rounded-seal border border-ink/45 bg-paper-raised p-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 md:max-w-xl">
            <p className="label-mono text-ink-faint">Standalone add-on</p>
            <h2 className="mt-3 font-display text-[20px] font-semibold text-ink">
              {ADD_ON.name} —{" "}
              <span className="whitespace-nowrap tabular-nums">
                {formatINR(ADD_ON.price)}
              </span>
              <span className="text-[15px] font-normal text-ink-soft">
                {" "}
                / month
              </span>
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
              {ADD_ON.description}
            </p>
          </div>
          <Button href={ADD_ON.cta.href} variant="ghost" className="shrink-0">
            {ADD_ON.cta.label}
          </Button>
        </div>
      </div>
    </>
  );
}
