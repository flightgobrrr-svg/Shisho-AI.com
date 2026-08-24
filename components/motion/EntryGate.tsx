"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoLockup } from "@/components/brand/Logo";
import { Eyebrow } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { StepMark } from "@/components/ui/StepMark";
import { cn } from "@/lib/cn";

/**
 * The mandatory front door: a five-second hold on the mark, then the
 * audience picker, before the site underneath is ever seen. Both stages
 * live in one component and one session flag because they are one
 * sequence, not two independent overlays that happen to run back to back —
 * this replaces the splash-only IntroSplash and the homepage's
 * AudiencePicker section, both now folded in here (see git history for
 * either's own reasoning, most of which still applies).
 *
 * Once per browser session — deciding client-side via `sessionStorage`
 * rather than server-side via a cookie is the same trade as before: reading
 * a cookie in the root layout would take every route off static generation,
 * which is too high a cost for a cosmetic gate. The accepted imperfection is
 * unchanged too — a manual reload later in the session can flash the
 * overlay for a single frame before the layout effect removes it.
 *
 * Choosing an audience is not decorative here — it navigates. A visitor who
 * followed a direct link to, say, a specific document page is still routed
 * to their audience's destination on first entry this session, not to the
 * page they actually clicked through for. That trade was made on an
 * explicit "make it mandatory" instruction, not by accident; worth
 * revisiting if it costs more in lost deep-link traffic than it gains in
 * self-directed routing.
 *
 * FOUR audiences now, not the three PRODUCT.md confirms as owner-selected
 * and equally weighted. "Advocates" collapses what used to be two separate
 * points on one continuous career arc (junior / practising) into a single
 * generic card, and "General public" and "Clerks" are not audiences
 * PRODUCT.md names anywhere — both were added on an explicit later
 * instruction that knowingly reopened that framing, not because the product
 * spec changed to match. If PRODUCT.md's own audience section is ever
 * updated, reconcile it against this list rather than assuming either one
 * is current.
 *
 * No full focus trap. Matches the level of rigor the splash-only version
 * already shipped with: it covers the page visually and blocks scroll, and
 * moves focus onto the first card when the picker appears, but a keyboard
 * user tabbing far enough can still reach the nav behind it. Flagged, not
 * silently assumed solved.
 */

const SESSION_KEY = "shisho-entry-complete";
const HOLD_MS = 5000;
const FADE_MS = 420;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const AUDIENCES = [
  {
    n: 1,
    name: "Law students",
    detail: "Learning to read law and put a first document on paper.",
    cta: "Start with courses",
    href: "/courses",
  },
  {
    n: 2,
    name: "Advocates",
    detail: "In practice — drafting, checking citations, moving fast.",
    cta: "Try Shisho",
    href: "/draft-bot",
  },
  {
    n: 3,
    name: "General public",
    detail: "Curious how a case actually moves through the system.",
    cta: "See the map",
    href: "/map",
  },
  {
    n: 4,
    name: "Clerks",
    detail: "Handling filings and paperwork — see what each document needs.",
    cta: "Browse the documents",
    href: "/documents",
  },
] as const;

type Phase =
  | "splash"
  | "splash-exit"
  | "picker"
  | "picker-confirm"
  | "picker-exit"
  | "done";

/* The pause between a card being chosen and the whole picker starting to
   fade, so the choice actually registers on screen — the chosen card holds
   its lit state, the other two recede — before anything dissolves. Without
   this beat the confirmation and the exit fade were both animating opacity
   on the same beat and cancelled each other out visually: nothing looked
   chosen, it all just faded together. */
const CONFIRM_MS = 260;

export function EntryGate() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("splash");
  const [chosen, setChosen] = useState<string | null>(null);
  const reduceMotionRef = useRef(false);
  const firstCardRef = useRef<HTMLButtonElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      return;
    }

    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms));
    };

    /* Reduced motion skips both fade stages, same reasoning as the
       splash-only version: this overlay also blocks scroll and clicks, and
       a reduced-motion visitor shouldn't sit through fades they can't see
       just to reach a control they still have to use. */
    if (reduceMotionRef.current) {
      after(HOLD_MS, () => setPhase("picker"));
    } else {
      after(HOLD_MS, () => setPhase("splash-exit"));
      after(HOLD_MS + FADE_MS, () => setPhase("picker"));
    }

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (phase === "picker") firstCardRef.current?.focus();
  }, [phase]);

  function choose(audience: (typeof AUDIENCES)[number]) {
    if (phase !== "picker") return;
    setChosen(audience.href);
    sessionStorage.setItem(SESSION_KEY, "1");

    if (reduceMotionRef.current) {
      document.body.style.overflow = "";
      setPhase("done");
      router.push(audience.href);
      return;
    }

    setPhase("picker-confirm");
    setTimeout(() => {
      setPhase("picker-exit");
      setTimeout(() => {
        document.body.style.overflow = "";
        setPhase("done");
        router.push(audience.href);
      }, FADE_MS);
    }, CONFIRM_MS);
  }

  if (phase === "done") return null;

  const showingSplash = phase === "splash" || phase === "splash-exit";
  const showingPicker =
    phase === "picker" || phase === "picker-confirm" || phase === "picker-exit";
  const settling = phase === "picker-confirm" || phase === "picker-exit";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 overflow-y-auto bg-paper px-6 py-16">
      {showingSplash ? (
        <div
          role="status"
          aria-label="Loading Shisho AI"
          className={cn(
            "flex flex-col items-center gap-5",
            phase === "splash-exit" && "splash-out",
          )}
        >
          {/* Full-screen on purpose: this is the one moment the mark gets to
              be the whole page rather than a nav-bar detail. The full
              lockup, not the cropped emblem — its own wordmark and tagline
              are baked into the artwork, so no separate "Shisho AI" label
              is needed alongside it here (that label lived next to the
              plain emblem before this). Capped in px, not just vh — the
              source artwork is a 500px raster (public/shisho-logo.png, see
              Logo.tsx), and scaling past roughly its native size on a tall
              viewport would upscale it past the resolution it was actually
              drawn at. */}
          <LogoLockup className="rise h-[46vh] w-[46vh] max-h-[480px] max-w-[480px]" />
          {/* The hold is long enough now (five seconds) that a bare mark
              reads as stalled rather than deliberate. The track is the
              entrance rule: fixed width, resting state fully visible, no
              wondering whether it moved. The fill is the only thing that
              moves, width 0 -> 100% over exactly HOLD_MS, so it finishes
              precisely when the mark starts to fade — same inline-style
              pattern AmbientDrift already uses for a fixed-duration
              animation, not a new convention. Ink, not seal: this is a
              progress indicator, not a CTA or the annotation motif. */}
          <div className="mt-1 h-px w-40 overflow-hidden bg-ink/15">
            <div
              className="h-full bg-ink"
              style={{ animation: `shisho-progress ${HOLD_MS}ms linear forwards` }}
            />
          </div>
        </div>
      ) : null}

      {showingPicker ? (
        <div
          className={cn(
            "w-full max-w-5xl text-center",
            phase === "picker-exit" && "splash-out",
          )}
        >
          <div className="rise">
            <Eyebrow>Four starting points</Eyebrow>
            <h2 className="mt-4 font-display text-title font-semibold">
              Which one are <Emphasis>you</Emphasis>?
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 items-stretch gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((audience, i) => {
              const isChosen = chosen === audience.href;
              const receded = settling && !isChosen;

              return (
                <button
                  key={audience.name}
                  ref={i === 0 ? firstCardRef : undefined}
                  type="button"
                  onClick={() => choose(audience)}
                  disabled={settling}
                  className={cn(
                    /* `rise` is dropped the instant settling begins, not just
                       left to finish — if a card is clicked before its own
                       staggered entrance has resolved, the still-running
                       `shisho-rise` animation otherwise keeps full control of
                       `opacity` (an active CSS animation always wins over a
                       plain utility class on the same property) and silently
                       defeats `opacity-30`/the chosen card's own styling
                       below. Removing the class cancels the animation and
                       lets the static classes take over immediately. */
                    !settling && "rise",
                    "flex h-full flex-col rounded-seal border bg-paper-raised p-7 text-left",
                    "transition-[transform,box-shadow,border-color,opacity] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                    !settling &&
                      "hover:-translate-y-0.5 hover:border-ink/75 hover:shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]",
                    isChosen
                      ? "border-seal/60"
                      : settling
                        ? "border-ink/20"
                        : "border-ink/45",
                    settling && isChosen &&
                      "-translate-y-0.5 shadow-[0_12px_32px_-20px_rgba(34,37,43,0.45)]",
                    receded && "opacity-30",
                  )}
                  style={{ animationDelay: `${140 + i * 70}ms` }}
                >
                  <StepMark
                    n={audience.n}
                    className={cn(
                      "bg-paper-raised",
                      settling && isChosen && "border-seal/60 text-seal",
                    )}
                  />
                  <span className="mt-5 font-display text-[19px] font-semibold text-ink">
                    {audience.name}
                  </span>
                  <span className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                    {audience.detail}
                  </span>
                  <span className="mt-6 text-[14px] font-medium text-ink">
                    {audience.cta} →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
