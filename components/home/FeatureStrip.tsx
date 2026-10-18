import Link from "next/link";
import { Container, Section } from "@/components/ui/Section";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

const HREFS = ["/draft-bot", "/library", "/courses"] as const;

export function FeatureStrip({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).featureStrip;
  const FEATURES = t.features.map((f, i) => ({ ...f, href: HREFS[i] }));

  return (
    <Section tone="raised" className="border-y border-ink/10">
      <Container>
        {/* Same staggered entrance as the other grids down this page (the
            matter flow above, pricing below), so the scroll rhythm is
            continuous rather than this strip being the one section that
            simply appears.

            These three are the products, introduced *after* the matter flow
            has already named the stages they answer — the flow says what
            happens, this says what does it.

            No hover-lift here on purpose: the box itself is not a link, only
            the "Explore" line is, so lifting the whole box would promise a
            hit target that isn't there. */}
        <ul className="reveal-stagger grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <li
              key={feature.name}
              style={{ "--i": i } as React.CSSProperties}
              className="flex min-w-0 flex-col border border-ink/45 p-7 md:p-8"
            >
              <h2 className="font-display text-[22px] font-semibold text-ink">
                {feature.name}
              </h2>
              <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                {feature.body}
              </p>
              <Link
                href={feature.href}
                className="underline-draw mt-5 inline-block text-[14px] text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]"
              >
                {t.exploreLabel(feature.name)}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
