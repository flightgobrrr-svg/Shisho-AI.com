import { Emphasis } from "@/components/ui/Emphasis";
import type { Course } from "@/lib/courses";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article
      className={
        "flex min-w-0 flex-col rounded-seal border border-ink/10 bg-paper-raised p-7 md:p-8 " +
        "transition-[transform,box-shadow,border-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)] " +
        "hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]"
      }
    >
      <p className="label-mono text-ink-soft/70">{course.level}</p>

      <h3 className="mt-4 font-display text-[26px] leading-tight font-semibold text-ink">
        <Emphasis>{course.name}</Emphasis>
      </h3>

      <p className="label-mono mt-3 text-ink-soft/70">
        {/* TODO: confirm — duration and module count are proposed, not supplied. */}
        {course.duration} · {course.modules} modules
      </p>

      <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
        {course.summary}
      </p>

      <div className="mt-7 border-t border-ink/10 pt-6">
        <h4 className="label-mono text-ink-soft/70">Syllabus</h4>
        <ul className="mt-4 space-y-4">
          {course.syllabus.map((item) => (
            <li key={item.title} className="min-w-0">
              <p className="text-[15px] font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 border-t border-ink/10 pt-6">
        <h4 className="label-mono text-ink-soft/70">What&rsquo;s included</h4>
        <ul className="mt-4 space-y-2">
          {course.included.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft"
            >
              <span aria-hidden="true" className="mt-px text-ink-soft/60">
                &#10003;
              </span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
