import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AudienceHeadline } from "@/components/for/AudienceHeadline";
import { InterestSignup } from "@/components/for/InterestSignup";
import { StatusList } from "@/components/for/StatusList";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PAGE_AUDIENCES, getAudience } from "@/lib/audiences";
import { TODAY, startHereHeading } from "@/lib/audiencePages";

export function generateStaticParams() {
  return PAGE_AUDIENCES.map((a) => ({ slug: a.slug }));
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
      {/* The sample sits beside the pitch, as it does on the homepage, rather
          than alone in a band of its own with half the width left empty. */}
      <Section className="!pb-14 md:!pb-20">
        <Container>
          <Link
            href="/#audiences"
            className="underline-draw text-[14px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
          >
            <span aria-hidden="true">&larr; </span>Everyone it&rsquo;s for
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <Eyebrow>{audience.eyebrow}</Eyebrow>
                <span className="label-mono text-ink-faint">
                  {audience.live ? "Available now" : "Planned"}
                </span>
              </div>
              <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
                <AudienceHeadline text={audience.headline} />
              </h1>
              <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
                {audience.blurb}
              </p>
              {audience.aside ? (
                <div className="mt-5 max-w-[60ch] border-l border-ink/25 pl-4 text-[14px] leading-relaxed text-ink-soft">
                  <p>{audience.aside}</p>
                  {audience.sources ? (
                    <p className="mt-2 text-[13px] text-ink-faint">Sources: {audience.sources}</p>
                  ) : null}
                </div>
              ) : null}

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
            </div>

            {audience.sample ? (
              <div className="w-full max-w-xl rounded-seal border border-ink/20 bg-paper-raised p-6 md:p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="label-mono text-indigo">{audience.sample.label}</p>
                  <p className="label-mono text-ink-faint">Sample</p>
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
            ) : null}
          </div>
        </Container>
      </Section>

      {today.length > 0 ? (
        <Section tone="raised" className="border-t border-ink/10 !py-14 md:!py-20">
          <Container>
            <Eyebrow>Start here</Eyebrow>
            <h2 className="mt-4 max-w-xl font-display text-[1.5rem] font-semibold text-ink">
              {startHereHeading(Math.min(today.length, 3))}
            </h2>
            <div className="mt-6 max-w-3xl">
              <StatusList items={today.slice(0, 3)} numbered />
            </div>
            {audience.live ? null : (
              <div className="mt-12 border-t border-ink/10 pt-8">
                <InterestSignup audience={audience.slug} name={audience.name} />
              </div>
            )}
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
