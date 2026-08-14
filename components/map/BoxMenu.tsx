"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A map box that opens a choice when clicked — e.g. Arguments: oral or
 * written.
 *
 * The whole box is the trigger, so it reads as one object rather than a label
 * with a control bolted to its side. The panel is click-toggled, not hover-
 * opened like the nav menus: this is a selection someone commits to, and a
 * menu that opens on hover and closes on leave is hostile to that.
 *
 * Built as a disclosure of plain buttons rather than a listbox. A real listbox
 * owes the user arrow-key roving focus and typeahead; buttons get Tab order
 * and Enter for free, and Escape returns focus to the trigger. Choosing the
 * honest simpler pattern beats a half-implemented ARIA one.
 */
export function BoxMenu({
  label,
  boxRef,
  options,
  className,
}: {
  label: string;
  boxRef?: string;
  options: readonly string[];
  className?: string;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);

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
          <span className="label-mono shrink-0 text-ink-soft/70">{boxRef}</span>
        )}
        <span className="min-w-0">{label}</span>

        {/* The chosen value rides along quietly so the box still reports its
            own state once the panel is shut. */}
        {chosen && (
          <span className="ml-auto shrink-0 text-[13px] text-ink-soft">
            {chosen}
          </span>
        )}

        <svg
          aria-hidden="true"
          viewBox="0 0 10 6"
          className={cn(
            "ml-1.5 h-1.5 w-2.5 shrink-0 fill-none stroke-current stroke-[1.5] text-ink-soft",
            "transition-transform duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
            open && "rotate-180",
          )}
        >
          <path d="M1 1l4 4 4-4" strokeLinecap="square" />
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute top-[calc(100%+4px)] left-0 z-20 w-full min-w-36 border border-ink/45 bg-paper-raised p-1 shadow-[0_18px_44px_-16px_rgba(34,37,43,0.28)]"
      >
        <ul>
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                aria-pressed={chosen === option}
                onClick={() => {
                  setChosen(option);
                  setOpen(false);
                  triggerEl.current?.focus();
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-[14px]",
                  "transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:bg-paper",
                  chosen === option ? "text-ink" : "text-ink-soft",
                )}
              >
                {option}
                {chosen === option && (
                  <span aria-hidden="true" className="text-seal">
                    &#10003;
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
