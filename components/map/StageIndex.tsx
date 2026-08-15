"use client";

import { useEffect, useState } from "react";
import { StepMark } from "@/components/ui/StepMark";
import { MAP_STAGES } from "@/lib/sitemap";
import { cn } from "@/lib/cn";

/**
 * The stage index, with a live "you are here".
 *
 * The index already gave extent and a jump. What it could not give was
 * position: nine chips, none of them marked, across a 3,442px scroll — so the
 * reader knew how far the page went but never where in it they were.
 *
 * An IntersectionObserver rather than a scroll listener: the browser does the
 * work off the main thread and only calls back when a stage actually crosses
 * the band, instead of recomputing nine rects on every scroll event.
 *
 * The band is the top third of the viewport, which is where a reader's eye
 * sits when scanning down — not the centre, which lags a stage behind.
 */
export function StageIndex() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const els = MAP_STAGES.map((s) =>
      document.getElementById(`stage-${s.n}`),
    ).filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const seen = new Map<number, boolean>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const n = Number(e.target.id.replace("stage-", ""));
          seen.set(n, e.isIntersecting);
        }
        /* The topmost stage currently in the band wins, so passing from one
           into the next never leaves two marked.

           When nothing is in the band — at the very top before stage 1, and at
           the bottom once the last stage has passed above it — the previous
           mark is KEPT rather than cleared. Measured before this: the index
           went blank at scrollY 0 and again at the end of the page, so the one
           thing it exists to answer was unanswered at both ends. */
        const current = MAP_STAGES.map((s) => s.n).find((n) => seen.get(n));
        setActive((prev) => current ?? prev);
      },
      { rootMargin: "-12% 0px -62% 0px" },
    );

    els.forEach((el) => io.observe(el));

    /* End of page. The band sits in the top third, so once the document can
       scroll no further the last stages sit below it and can never enter —
       measured: at maximum scroll the index still read stage 7 while stage 9
       filled the screen. Nothing an observer can catch, because no crossing
       ever happens. One passive listener, coalesced to a frame, closes it. */
    let frame = 0;
    const onScroll = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const doc = document.documentElement;
        const atBottom =
          window.scrollY + window.innerHeight >= doc.scrollHeight - 4;
        if (atBottom) setActive(MAP_STAGES[MAP_STAGES.length - 1].n);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav aria-label="Jump to a stage" className="mt-9">
      <ul className="flex flex-wrap gap-2">
        {MAP_STAGES.map((stage) => {
          const isActive = active === stage.n;
          return (
            <li key={stage.n}>
              <a
                href={`#stage-${stage.n}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group flex min-h-11 items-center gap-2 border py-2 pr-3.5 pl-2 text-[13.5px]",
                  "transition-[transform,border-color,color,background-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                  "hover:-translate-y-0.5 hover:border-ink/60 hover:text-ink",
                  isActive
                    ? "border-ink/75 bg-paper text-ink"
                    : "border-ink/25 bg-paper-raised text-ink-soft",
                )}
              >
                <StepMark n={stage.n} className="size-5 text-[10px]" />
                {stage.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
