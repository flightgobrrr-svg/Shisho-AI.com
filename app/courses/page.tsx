import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Two courses for Indian law — Starter for foundations, Proficient for interim relief, commercial drafting, and litigation strategy. Plans from ₹9 at /pricing.",
};

const FAQS = [
  {
    q: "Do I need to be enrolled in a law school?",
    a: "No. The Starter course assumes no prior legal training, though it moves quickly. Proficient assumes you can read a judgment and follow a pleading.",
  },
  {
    q: "Is this a substitute for legal advice?",
    a: "No. Shisho AI is an educational and drafting tool. It does not provide legal advice and is not a substitute for an advocate enrolled with a State Bar Council.",
  },
];

export default function CoursesPage() {
  return (
    <>
      <Section>
        <Container>
          <Eyebrow>Courses</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-[2.05rem] leading-[1.08] font-semibold tracking-[-0.02em] sm:text-[2.6rem] lg:text-display">
            Two courses, one <Emphasis>mentor</Emphasis>.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[16.5px] leading-relaxed text-ink-soft md:text-[17.5px]">
            Both tracks are built entirely on Indian law — the Constitution, the
            CPC, the Indian Contract Act, and the authorities that actually bind
            an Indian court. Every drafting exercise comes back marked.
          </p>
        </Container>
      </Section>

      <Section tone="raised" className="border-y border-ink/10 !pt-0 pb-20 md:pb-28">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-seal border border-ink/45 bg-paper-raised p-8 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Eyebrow>Plans</Eyebrow>
              <h2 className="mt-4 max-w-lg font-display text-[22px] font-semibold text-ink">
                Start free. Upgrade when the bot becomes part of your{" "}
                <Emphasis>routine</Emphasis>.
              </h2>
              <p className="mt-3 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-soft">
                Four plans from ₹9 a month, and a standalone Draft Bot add-on —
                full breakdown on the pricing page.
              </p>
            </div>
            <Button href="/pricing" size="lg" className="shrink-0">
              See plans &amp; pricing
            </Button>
          </div>
        </Container>
      </Section>

      <Section tone="raised" className="border-t border-ink/10">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-4 font-display text-title font-semibold">
                Before you <Emphasis>begin</Emphasis>.
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
