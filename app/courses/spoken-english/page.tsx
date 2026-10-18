import type { Metadata } from "next";
import Link from "next/link";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { ClassesTabs } from "@/components/courses/ClassesTabs";
import { RecordedLessonsList } from "@/components/courses/RecordedLessonsList";
import { LiveSessionsList } from "@/components/courses/LiveSessionsList";
import { SPOKEN_ENGLISH_LESSONS, SPOKEN_ENGLISH_LIVE_SESSIONS } from "@/lib/recordings";

export const metadata: Metadata = {
  title: "Spoken English",
  description:
    "Recorded and live classes on spoken legal English — oral argument and courtroom submissions, in the register Indian courts expect out loud.",
};

/**
 * The oral counterpart to /courses/english — reading a judgment and writing
 * a pleading are a different skill from being clearly understood arguing it
 * out loud, and a student confident on paper can still need real practice on
 * their feet (and vice versa). See lib/recordings.ts for why this is a
 * second, separate set of arrays rather than a section on the same page.
 */
export default function SpokenEnglishClassPage() {
  return (
    <>
      <Section>
        <Container>
          <Eyebrow>Spoken English</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title md:text-display">
            The <Emphasis>spoken</Emphasis> register courts expect.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft">
            Oral argument and courtroom submissions, in the English an
            Indian courtroom expects out loud — recorded classes to watch in
            any order, and live sessions on the calendar below. Nothing here
            is timed or graded.
          </p>
          <p className="mt-4 text-[14px] text-ink-soft">
            Looking for reading and writing instead?{" "}
            <Link
              href="/courses/english"
              className="underline-draw text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink-soft"
            >
              Legal English is its own track →
            </Link>
          </p>
        </Container>
      </Section>

      <Section tone="raised" className="border-t border-ink/10">
        <Container>
          <ClassesTabs
            recorded={<RecordedLessonsList lessons={SPOKEN_ENGLISH_LESSONS} />}
            live={<LiveSessionsList sessions={SPOKEN_ENGLISH_LIVE_SESSIONS} />}
          />
        </Container>
      </Section>
    </>
  );
}
