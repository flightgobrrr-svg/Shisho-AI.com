"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogoLockup } from "@/components/brand/Logo";
import { Eyebrow } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { StepMark } from "@/components/ui/StepMark";
import { cn } from "@/lib/cn";

/**
 * The front door: a short hold on the mark, then the audience picker, shown
 * once per browser session and only on the homepage. Both stages live in one
 * component and one session flag because they are one sequence.
 *
 * Only on `/`. A visitor who followed a shared link to a document, a
 * judgment or a pricing page sees that page, never this overlay, so deep
 * links and search results land where they point. (An earlier version ran on
 * every route and redirected deep links to the chosen audience's page.)
 *
 * Skippable: a Skip button and Escape both dismiss it straight to the
 * homepage, and the hold is under a second — a returning litigator should
 * not sit through a splash. While it is up the page behind is `inert`, so
 * keyboard focus cannot wander into the nav under the overlay.
 *
 * Once per browser session, decided client-side via `sessionStorage` rather
 * than a server cookie: reading a cookie in the root layout would take every
 * route off static generation, too high a cost for a cosmetic gate. The
 * accepted imperfection: a reload later in the session can flash the overlay
 * for a single frame before the layout effect removes it.
 *
 * FOUR audiences, kept deliberately — General public is intentional, as the
 * owner confirmed. PRODUCT.md lists three; if its audience section is ever
 * updated, reconcile it against this list.
 */

const SESSION_KEY = "shisho-entry-complete";
const HOLD_MS = 900;
const FADE_MS = 420;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const AUDIENCES = [
  {
    n: 1,
    name: "Advocates",
    detail: "In practice — drafting, advice and opinions, checking citations against the Acts.",
    cta: "Try Shisho",
    href: "/draft-bot",
  },
  {
    n: 2,
    name: "Advocate Clerks",
    detail: "Handling filings and paperwork — see what each document needs.",
    cta: "Open the practice manual",
    href: "/clerks",
  },
  {
    n: 3,
    name: "Law students",
    detail: "Learning to read law and put a first document on paper.",
    cta: "Start with courses",
    href: "/courses",
  },
  {
    n: 4,
    name: "General public",
    detail: "Curious how a case actually moves through the system.",
    cta: "See the map",
    href: "/map",
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
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("splash");
  const [chosen, setChosen] = useState<string | null>(null);
  const reduceMotionRef = useRef(false);
  const firstCardRef = useRef<HTMLButtonElement>(null);

  /** Dismiss the overlay and give the page back (scroll, focus, inert). */
  function release() {
    document.body.style.overflow = "";
    setInert(false);
    setPhase("done");
  }

  function skip() {
    sessionStorage.setItem(SESSION_KEY, "1");
    release();
  }

  useIsomorphicLayoutEffect(() => {
    if (pathname !== "/" || sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      return;
    }
    setInert(true);

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

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      setInert(false);
    };
    // skip() only touches stable setters and storage, so it is safe to omit.
  }, [pathname]);

  useEffect(() => {
    if (phase === "picker") firstCardRef.current?.focus();
  }, [phase]);

  function choose(audience: (typeof AUDIENCES)[number]) {
    if (phase !== "picker") return;
    setChosen(audience.href);
    sessionStorage.setItem(SESSION_KEY, "1");

    if (reduceMotionRef.current) {
      release();
      router.push(audience.href);
      return;
    }

    setPhase("picker-confirm");
    setTimeout(() => {
      setPhase("picker-exit");
      setTimeout(() => {
        release();
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Shisho AI"
      className="fixed inset-0 z-[200] flex flex-col items-center gap-4 overflow-y-auto bg-paper px-6 py-16"
    >
      {/* Skip sits outside the stages so it is there for both. */}
      <button
        type="button"
        onClick={skip}
        className="absolute right-5 top-5 rounded-seal border border-ink/30 px-3.5 py-1.5 text-[13px] text-ink transition-colors hover:border-ink/70 hover:bg-ink/[0.04]"
      >
        Skip
      </button>
      {showingSplash ? (
        <div
          role="status"
          aria-label="Loading Shisho AI"
          className={cn(
            "my-auto flex flex-col items-center gap-5",
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
              Logo.tsx), and this is that native size exactly: any larger and
              a tall viewport would upscale it past the resolution it was
              actually drawn at. */}
          <LogoLockup className="rise h-[52vh] w-[52vh] max-h-[500px] max-w-[500px]" />
          {/* A thin track so the short hold reads as deliberate, not stalled.
              The fill moves 0 -> 100% over exactly HOLD_MS. Ink, not seal:
              this is a progress indicator, not a CTA. */}
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
            "my-auto w-full max-w-5xl text-center",
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

/** Make the page behind the overlay unreachable by keyboard and screen reader. */
function setInert(on: boolean) {
  document.querySelectorAll("header, main, footer").forEach((el) => {
    if (on) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  });
}
