import type { Metadata } from "next";
import Link from "next/link";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { ClassesTabs } from "@/components/courses/ClassesTabs";
import { RecordedLessonsList } from "@/components/courses/RecordedLessonsList";
import { LiveSessionsList } from "@/components/courses/LiveSessionsList";
import { LEGAL_ENGLISH_LESSONS, LEGAL_ENGLISH_LIVE_SESSIONS } from "@/lib/recordings";

export const metadata: Metadata = {
  title: "Legal English",
  description:
    "Recorded and live classes on legal English — reading a judgment and writing a pleading in the register Indian courts expect on paper.",
};

export default function EnglishClassPage() {
  return (
    <>
      <Section>
        <Container>
          <Eyebrow>Legal English</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-title md:text-display">
            The <Emphasis>written</Emphasis> register courts expect.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft">
            Reading a judgment and writing a pleading, in the English an
            Indian courtroom expects on paper — recorded classes to watch in
            any order, and live sessions on the calendar below. Nothing here
            is timed or graded.
          </p>
          <p className="mt-4 text-[14px] text-ink-soft">
            Looking for oral argument instead?{" "}
            <Link
              href="/courses/spoken-english"
              className="underline-draw text-ink transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink-soft"
            >
              Spoken English is its own track →
            </Link>
          </p>
        </Container>
      </Section>

      <Section tone="raised">
        <Container>
          <ClassesTabs
            recorded={<RecordedLessonsList lessons={LEGAL_ENGLISH_LESSONS} />}
            live={<LiveSessionsList sessions={LEGAL_ENGLISH_LIVE_SESSIONS} />}
          />
        </Container>
      </Section>
    </>
  );
}
