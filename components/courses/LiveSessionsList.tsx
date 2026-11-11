import { Button } from "@/components/ui/Button";
import { formatSessionTime, type LiveSession } from "@/lib/recordings";

/**
 * Shared "live" tabpanel content for both English tracks
 * (/courses/english, /courses/spoken-english) — a schedule, not a video
 * grid, so this is deliberately not LessonList/the recorded markup reused:
 * a session has a date/time and an optional join link instead of an embed.
 *
 * No "use client" — this is static markup from a static array, exactly like
 * the recorded list it sits beside; the interactivity is entirely in
 * ClassesTabs, which just decides whether this is visible.
 */
export function LiveSessionsList({ sessions }: { sessions: LiveSession[] }) {
  if (sessions.length === 0) {
    // Honest empty state, same contract as the recorded tracks' own: say
    // why nothing is here rather than a generic "no results" or, worse, an
    // invented date.
    return (
      <div className="max-w-[62ch] border-l-2 border-seal/70 pl-6">
        <p className="font-display text-[19px] leading-snug font-semibold text-ink">
          No live classes scheduled yet.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Nothing is on the calendar for this track yet — this page is built
          and ready, but empty on purpose rather than a placeholder session.
          Check back soon.
        </p>
        <Button href="/courses" variant="ghost" className="mt-6">
          Back to courses
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid gap-8 md:grid-cols-2">
      {sessions.map((session) => (
        <li
          key={session.id}
          className="flex min-w-0 flex-col rounded-seal border border-ink/45 bg-paper-raised p-6"
        >
          <p className="label-mono text-indigo">{formatSessionTime(session.startsAt)} IST</p>
          <h3 className="mt-3 font-display text-[18px] font-semibold text-ink">
            {session.title}
          </h3>
          <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
            {session.description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="label-mono shrink-0 text-ink-faint">{session.duration}</span>
            {session.joinUrl ? (
              <Button href={session.joinUrl} size="sm">
                Join
              </Button>
            ) : (
              <span className="text-[13px] text-ink-soft">Join link coming soon</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
