import { Button } from "@/components/ui/Button";
import { embedUrl, type Lesson } from "@/lib/recordings";

/**
 * Shared "recorded" tabpanel content for both English tracks
 * (/courses/english, /courses/spoken-english) — extracted once both pages
 * needed the identical grid alongside a new "live" tabpanel
 * (components/courses/LiveSessionsList.tsx), rather than duplicating it a
 * second time.
 */
export function RecordedLessonsList({ lessons }: { lessons: Lesson[] }) {
  if (lessons.length === 0) {
    // Honest empty state, same contract as the Library's trial-courts box:
    // say why nothing is here rather than a generic "no results" or,
    // worse, a placeholder lesson.
    return (
      <div className="max-w-[62ch] border-l-2 border-seal/70 pl-6">
        <p className="font-display text-[19px] leading-snug font-semibold text-ink">
          No classes yet.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Nothing has been recorded for this track yet — this page is built
          and ready, but empty on purpose rather than filled with a
          placeholder class. Check back soon.
        </p>
        <Button href="/courses" variant="ghost" className="mt-6">
          Back to courses
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid gap-8 md:grid-cols-2">
      {lessons.map((lesson) => (
        <li
          key={lesson.id}
          className="flex min-w-0 flex-col rounded-seal border border-ink/45 bg-paper-raised p-6"
        >
          <div className="aspect-video w-full overflow-hidden rounded-seal bg-ink/10">
            <iframe
              src={embedUrl(lesson)}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="mt-5 flex items-baseline justify-between gap-3">
            <h3 className="font-display text-[18px] font-semibold text-ink">{lesson.title}</h3>
            <span className="label-mono shrink-0 text-ink-faint">{lesson.duration}</span>
          </div>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
            {lesson.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
