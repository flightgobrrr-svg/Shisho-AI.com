"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * A map box that opens a short menu when clicked — e.g. Arguments: oral or
 * written.
 *
 * The whole box is the trigger, so it reads as one object rather than a label
 * with a control bolted to its side. Click-toggled, not hover-opened like the
 * nav menus: this is a destination someone commits to, and a menu that closes
 * when the pointer strays is hostile to that.
 *
 * The options are LINKS, not values. A box that only recorded a choice would
 * be the one dead end left on the map, so choosing here navigates.
 *
 * Built as a disclosure of links rather than a menubar widget: a real ARIA
 * menu owes the user roving arrow-key focus and typeahead, while links get Tab
 * order, Enter, and open-in-new-tab for free. Escape closes and returns focus
 * to the trigger.
 */
export function BoxMenu({
  label,
  boxRef,
  options,
  className,
}: {
  label: string;
  boxRef?: string;
  options: readonly { label: string; href: string }[];
  className?: string;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  const rootEl = useRef<HTMLDivElement>(null);
  const triggerEl = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    /* pointerdown, not click: a click listener would fire after the trigger's
       own handler had already reopened the panel. */
    const onPointerDown = (e: PointerEvent) => {
      if (!rootEl.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerEl.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootEl} className="relative">
      <button
        ref={triggerEl}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          className,
          "w-full cursor-pointer text-left",
          "transition-[border-color,background-color] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
          "hover:border-ink/75",
        )}
      >
        {boxRef && (
          <span className="label-mono shrink-0 text-ink-soft">{boxRef}</span>
        )}
        <span className="min-w-0">{label}</span>

        {/* A divided cell, not just a chevron. This box sits in a row of
            link-boxes it otherwise matches pixel for pixel, and a 10×6px mark
            was the only thing separating a control from a destination — a
            difference nobody discovers before clicking. The rule gives the
            chevron a compartment, which is how every other divided control on
            a court form reads. */}
        <span
          aria-hidden="true"
          className="ml-auto flex shrink-0 items-center self-stretch border-l border-ink/25 pl-3"
        >
          <svg
            viewBox="0 0 10 6"
            className={cn(
              "h-1.5 w-2.5 fill-none stroke-current stroke-[1.5] text-ink-soft",
              "transition-transform duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
              open && "rotate-180",
            )}
          >
            <path d="M1 1l4 4 4-4" strokeLinecap="square" />
          </svg>
        </span>
      </button>

      {/* `visibility` rather than the `hidden` attribute: hidden is
          display:none, which cannot transition from, so the panel used to
          appear with no acknowledgment at all. visibility:hidden keeps it out
          of the tab order and the accessibility tree just the same, and it is
          transitionable — so the panel can answer the click.

          150ms in, and the transform is 3px: this is feedback, not an
          entrance. Anything longer reads as latency on a menu. */}
      <div
        id={panelId}
        className={cn(
          "absolute top-[calc(100%+4px)] left-0 z-20 w-full min-w-40 border border-ink/45 bg-paper-raised p-1 shadow-[0_18px_44px_-16px_rgba(34,37,43,0.28)]",
          "transition-[opacity,transform,visibility] duration-150 ease-[var(--ease-precise)]",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <ul>
          {options.map((option) => (
            <li key={option.href}>
              <Link
                href={option.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center px-3 py-2.5 text-[14px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:bg-paper hover:text-ink"
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
