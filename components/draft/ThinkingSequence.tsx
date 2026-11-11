/**
 * Shown in DraftingAgent while a live request is in flight. There is no real
 * progress signal from a single request (see app/api/assistant/route.ts), so
 * this says only what is true: Shisho is working, and roughly how long that
 * takes. An earlier version stepped through "Checking the limitation
 * position" and "Cross-checking the citations" on a timer — stages that were
 * not tied to anything the backend was doing, which would have told a
 * lawyer a check had happened when it had not.
 */
export function ThinkingSequence() {
  return (
    <p
      aria-live="polite"
      aria-busy="true"
      className="mt-4 flex items-center gap-2 text-[14px] text-ink-soft"
    >
      <ClockIcon className="size-[18px] shrink-0" />
      <span>Drafting — this usually takes 15 to 25 seconds.</span>
    </p>
  );
}

/* Four line-art icons, one per stage — authored SVG rather than a stock icon
 * font or emoji, one consistent stroke weight, matching the chevron in
 * components/map/BoxMenu.tsx (fill-none, stroke-current, stroke-[1.5],
 * square caps/joins — no rounded corners anywhere, same as --radius-seal: 0
 * everywhere else on the site). Ink, not seal: seal is reserved for CTAs and
 * the annotation motif only, never a status icon. */

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`fill-none stroke-current stroke-[1.5] text-ink-soft ${className ?? ""}`}
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v4.7l3.3 2" strokeLinecap="square" />
    </svg>
  );
}
