import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AudienceHeadline } from "@/components/for/AudienceHeadline";
import { StatusList } from "@/components/for/StatusList";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PLANNED_AUDIENCES, getAudience } from "@/lib/audiences";
import { TODAY } from "@/lib/audiencePages";

export function generateStaticParams() {
  return PLANNED_AUDIENCES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const audience = getAudience(slug);
  if (!audience) return {};
  return { title: audience.eyebrow, description: audience.blurb };
}

/**
 * One audience: the pitch, a labelled sample, and — separately — what on the
 * site already serves them. The pitch is planned and says so; "Available
 * today" is the part that is true now (PRODUCT.md, "Pre-launch honesty").
 */
export default async function AudiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const audience = getAudience(slug);
  if (!audience) notFound();

  const today = TODAY[audience.slug] ?? [];

  return (
    <>
      <Section className="!pb-12">
        <Container>
          <Link
            href="/#audiences"
            className="underline-draw label-mono text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
          >
            Who it&rsquo;s for
          </Link>

          <div className="mt-6 flex items-baseline gap-4">
            <Eyebrow>{audience.eyebrow}</Eyebrow>
            <span className="label-mono text-ink-soft/70">Planned</span>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
            <AudienceHeadline text={audience.headline} />
          </h1>
          <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
            {audience.blurb}
          </p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {audience.chips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-ink/30 px-3.5 py-1.5 text-[13.5px] text-ink"
              >
                {chip}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {audience.sample ? (
        <Section tone="raised" className="border-y border-ink/10 !py-14 md:!py-16">
          <Container>
            <div className="max-w-xl rounded-seal border border-ink/20 bg-paper p-6 md:p-7">
              <div className="flex items-baseline justify-between gap-4">
                <p className="label-mono text-indigo">{audience.sample.label}</p>
                <p className="label-mono text-ink-soft/70">Sample</p>
              </div>
              <dl className="mt-5 divide-y divide-ink/10">
                {audience.sample.rows.map((row) => (
                  <div
                    key={row.term}
                    className="flex items-baseline justify-between gap-6 py-3"
                  >
                    <dt className="font-display text-[16px] font-semibold text-ink">
                      {row.term}
                    </dt>
                    {row.detail ? (
                      <dd className="max-w-[28ch] text-right text-[14px] leading-relaxed text-ink-soft">
                        {row.detail}
                      </dd>
                    ) : null}
                  </div>
                ))}
              </dl>
              {audience.disclaimer ? (
                <p className="mt-4 text-[13px] italic text-ink-soft">
                  {audience.disclaimer}
                </p>
              ) : null}
            </div>
          </Container>
        </Section>
      ) : null}

      {today.length > 0 ? (
        <Section className="!py-14 md:!py-16">
          <Container>
            <Eyebrow>Available today</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-[1.5rem] font-semibold text-ink">
              What on the site already helps.
            </h2>
            <div className="mt-6 max-w-3xl">
              <StatusList items={today} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/draft-bot">Try Shisho</Button>
              <Button href="/#audiences" variant="ghost">
                Everyone it&rsquo;s for
              </Button>
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
