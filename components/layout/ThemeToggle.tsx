"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark";

const STORAGE_KEY = "shisho-theme";
/** Dispatched on toggle so useSyncExternalStore's subscribe below actually
 *  has something to listen for — mutating `document.documentElement.dataset`
 *  and localStorage directly, as toggle() does, is invisible to React
 *  otherwise. See the inline script in app/layout.tsx for the matching
 *  before-paint half of this (applies a stored override with no flash). */
const THEME_EVENT = "shisho-theme-change";

function getSnapshot(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// No `window` on the server; light matches :root's own un-overridden default.
const getServerSnapshot = (): Theme => "light";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

/**
 * Sun/moon toggle — flips between light and dark explicitly, persisted to
 * localStorage. Before this is ever clicked, the theme is whatever
 * `prefers-color-scheme` says (app/globals.css handles that with pure CSS,
 * no JS needed); clicking commits an explicit override.
 *
 * useSyncExternalStore rather than useState+useEffect: the same reasoning
 * as useSpeechToText.ts — reading `document.documentElement.dataset` is an
 * external, browser-only fact, and doing it via a state-in-effect would
 * both violate the project's own lint rule and cost this button one visible
 * frame of the wrong icon after hydration. Here it also picks up genuine
 * re-renders on toggle, via the dispatched event above.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing or storage disabled — the toggle still works for
      // this page view, it just won't be remembered next visit.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-seal border border-ink/45 text-ink-soft",
        "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/75 hover:text-ink",
        className,
      )}
    >
      {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("fill-none stroke-current stroke-[1.5]", className)}>
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6L19 19M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4L19 5"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("fill-none stroke-current stroke-[1.5]", className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.7 6.7 0 0 0 10.2 10.2Z"
      />
    </svg>
  );
}
