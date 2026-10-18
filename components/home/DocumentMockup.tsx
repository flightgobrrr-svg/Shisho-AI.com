"use client";

import { useState } from "react";
import { ScrubReveal } from "@/components/motion/ScrubReveal";
import { HERO_TIMING } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * An annotated writ petition — the signature of the whole site.
 *
 * LAYOUT. Below `sm` this is a single column: the document at full width with
 * the notes stacked underneath as cards. Margin annotation is a desktop
 * affordance — at 320px a 8.5rem margin left ~150px for the pleading text,
 * which is the "shrunk, not designed" failure. On a phone the same
 * information becomes a note list, tied to the document by the superscript
 * markers.
 *
 * INTERACTION. Hovering or focusing a note highlights the clause it marks,
 * and vice versa. This is the same mechanic the real Draft Bot uses, so the
 * hero demonstrates the product rather than merely illustrating it.
 *
 * ACCESSIBILITY. The pleading body is decorative texture and stays
 * aria-hidden, with the <figcaption> carrying its description. The notes are
 * real buttons with real text — they are the meaningful content here, so they
 * are exposed to assistive tech and reachable by keyboard.
 *
 * Notes resolve on scroll — each appears as the mockup travels through the
 * viewport, staggered so scrolling reads as a mentor marking up the page.
 * Chromium: `animation-timeline: view()` via `.scrub-reveal`. Safari /
 * Firefox: scroll listener in ScrubReveal.tsx. Reduced motion: visible at
 * rest via the global backstop.
 */

const NOTES = [
  {
    marker: "1",
    text: "Cite Maneka Gandhi v. Union of India, (1978) 1 SCC 248 here.",
  },
  { marker: "2", text: "Art. 226 — plead territorial jurisdiction expressly." },
  { marker: "3", text: "Why no alternate remedy? Address it before the prayer." },
];

function Marker({ n, active }: { n: string; active: boolean }) {
  return (
    <sup
      className={cn(
        "ml-0.5 font-sans text-[7px] font-semibold transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
        active ? "text-seal" : "text-seal/70",
      )}
    >
      {n}
    </sup>
  );
}

/** A clause that a note points at. Highlights when its note is engaged. */
function Clause({
  id,
  active,
  children,
}: {
  id: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      data-clause={id}
      className={cn(
        "-mx-1 rounded-[2px] px-1 transition-colors duration-200 ease-[var(--ease-precise)]",
        active ? "bg-seal/12" : "bg-transparent",
      )}
    >
      {children}
    </span>
  );
}

export function DocumentMockup({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const clear = () => setActive(null);

  return (
    <figure className={cn("relative", className)}>
      <div
        className={cn(
          "relative rounded-seal border border-ink/10 bg-paper-raised",
          "shadow-[0_1px_2px_rgba(30,33,39,0.04),0_12px_32px_-12px_rgba(30,33,39,0.16)]",
          "rotate-[-0.4deg]",
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_10rem]">
          {/* ---- The draft --------------------------------------------- */}
          <div
            aria-hidden="true"
            className="p-5 font-mono text-[10px] leading-[1.85] text-ink-soft sm:p-6"
          >
            <p className="text-center font-medium tracking-[0.04em] text-ink">
              IN THE HIGH COURT OF DELHI AT NEW DELHI
            </p>
            <p className="mt-0.5 text-center tracking-[0.06em]">
              CIVIL WRIT JURISDICTION
            </p>

            <p className="mt-3 text-center">
              W.P. (C) No. <span className="text-ink-faint">____</span> of 2026
            </p>

            <div className="mt-3 border-t border-ink/10 pt-3">
              <Clause id="2" active={active === "2"}>
                In the matter of Article 226 of the Constitution of India
                <Marker n="2" active={active === "2"} />
              </Clause>
            </div>

            <div className="mt-3 space-y-0.5">
              <p>Ramesh Kumar Sharma ..... Petitioner</p>
              <p className="text-center text-ink-faint">versus</p>
              <p>Union of India &amp; Ors. ..... Respondents</p>
            </div>

            <p className="mt-4 font-medium tracking-[0.05em] text-ink">
              MOST RESPECTFULLY SHOWETH:
            </p>

            <ol className="mt-2 space-y-1.5">
              <li>
                <Clause id="1" active={active === "1"}>
                  1. That the Petitioner is a citizen of India and is possessed
                  of the fundamental rights guaranteed under Part III of the
                  Constitution.
                  <Marker n="1" active={active === "1"} />
                </Clause>
              </li>
              <li>
                2. That the impugned order dated 14.03.2026 was passed without
                affording the Petitioner any opportunity of hearing.
              </li>
              <li>
                <Clause id="3" active={active === "3"}>
                  3. That the Petitioner has no other efficacious remedy
                  available.
                  <Marker n="3" active={active === "3"} />
                </Clause>
              </li>
            </ol>

            <p className="mt-4 text-center font-medium tracking-[0.05em] text-ink">
              PRAYER
            </p>
            <p className="mt-1.5">
              It is therefore most respectfully prayed that this Hon&rsquo;ble
              Court may be pleased to issue a writ of certiorari quashing the
              impugned order dated 14.03.2026 ...
            </p>
          </div>

          {/* ---- The notes: a margin on desktop, a list on mobile ------- */}
          <div className="border-t border-ink/10 p-4 sm:border-t-0 sm:border-l sm:p-5">
            <p className="label-mono text-[8px] text-ink-faint">
              Shisho notes
            </p>

            <ul className="mt-3 space-y-2 sm:space-y-4">
              {NOTES.map((note, i) => (
                <ScrubReveal key={note.marker} index={i} total={NOTES.length}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(note.marker)}
                    onMouseLeave={clear}
                    onFocus={() => setActive(note.marker)}
                    onBlur={clear}
                    className={cn(
                      "flex w-full gap-1.5 rounded-[2px] px-1 py-0.5 text-left",
                      "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                      active === note.marker ? "bg-seal/8" : "bg-transparent",
                    )}
                  >
                    <span className="mt-px font-sans text-[8px] font-semibold text-seal">
                      {note.marker}
                    </span>
                    <span className="font-sans text-[11px] leading-snug text-seal sm:text-[10px]">
                      {note.text}
                    </span>
                  </button>
                </ScrubReveal>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ---- The hanko — the one bold move on the page ---------------- */}
      <span
        aria-hidden="true"
        className="absolute -top-4 -right-3 grid size-14 place-items-center rounded-full border-2 border-seal/70 bg-paper/80 text-[22px] leading-none text-seal/80 backdrop-blur-[2px] sm:-right-5 sm:size-16 sm:text-[26px]"
        style={{
          fontFamily:
            '"Noto Sans JP", "Hiragino Sans", "Yu Gothic UI", "Yu Gothic", "Microsoft YaHei", sans-serif',
          animation: `shisho-stamp 400ms var(--ease-precise) both`,
          animationDelay: `${HERO_TIMING.stamp}ms`,
        }}
      >
        志
      </span>

      <figcaption className="sr-only">
        A writ petition before the High Court of Delhi under Article 226,
        annotated in the margin with three Shisho notes. Select a note to
        highlight the clause it marks.
      </figcaption>
    </figure>
  );
}
