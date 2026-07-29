"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll reveal that works in every engine.
 *
 * Chromium gets the pure-CSS path (`animation-timeline: view()` in
 * globals.css) and this component costs it nothing — the effect below bails
 * out immediately once it sees the feature is supported.
 *
 * Safari and Firefox have no scroll-driven animation, which is why the
 * showcase section previously had no entrance for most non-Chrome visitors at
 * all. There, this observes the element and flips a data attribute.
 *
 * `useLayoutEffect` rather than `useEffect`: the hidden state has to be
 * applied before the browser paints, or the content would flash in and then
 * disappear. Aliased for SSR, where layout effects don't run and React warns.
 */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Reveal({
  children,
  className,
  index,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Position in a group; offsets the reveal by 60ms per step. */
  index?: number;
  as?: "div" | "section" | "li" | "figure";
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Chromium already handles this in CSS — do nothing.
    if (
      typeof CSS !== "undefined" &&
      CSS.supports?.("animation-timeline: view()")
    ) {
      return;
    }

    // Motion is unwanted: leave the element in its visible resting state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("reveal", className)}
      style={index === undefined ? undefined : ({ "--i": index } as React.CSSProperties)}
    >
      {children}
    </Tag>
  );
}
