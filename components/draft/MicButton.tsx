"use client";

import { cn } from "@/lib/cn";

/**
 * Dictate facts instead of typing them — wraps the browser's own Web
 * Speech API (useSpeechToText.ts), so this only ever renders when
 * `supported` is true (Chrome/Edge/Safari; not Firefox by default) rather
 * than showing a button that would just fail.
 */
export function MicButton({
  listening,
  onClick,
  className,
}: {
  listening: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={listening}
      aria-label={listening ? "Stop dictating" : "Dictate the facts"}
      title={listening ? "Stop dictating" : "Dictate the facts"}
      className={cn(
        "flex items-center justify-center rounded-seal border px-3 py-1.5 transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
        listening
          ? "border-ink/75 text-ink"
          : "border-ink/45 text-ink-soft hover:border-ink/75 hover:text-ink",
        className,
      )}
    >
      <MicIcon className={cn("size-4", listening && "animate-pulse")} />
      <span className="sr-only">{listening ? "Stop dictating" : "Dictate the facts"}</span>
    </button>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("fill-none stroke-current stroke-[1.5]", className)}
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" strokeLinecap="square" />
      <path d="M12 18v3" strokeLinecap="square" />
      <path d="M8.5 21h7" strokeLinecap="square" />
    </svg>
  );
}
