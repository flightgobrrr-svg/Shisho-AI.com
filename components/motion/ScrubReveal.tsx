"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll-scrubbed reveal for elements inside a scrolling container.
 *
 * Chromium: pure CSS via `animation-timeline: view()` and per-item
 * `--scrub-start` / `--scrub-end` ranges (see `.scrub-reveal` in globals.css).
 *
 * Safari / Firefox: a scroll listener on the nearest `<figure>` ancestor
 * drives opacity and translate, staggered by `index`.
 *
 * Resting rule is visible (opacity 1) — same contract as `.reveal`.
 */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ScrubReveal({
  children,
  index,
  total,
  className,
}: {
  children: React.ReactNode;
  index: number;
  total: number;
  className?: string;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [inline, setInline] = useState<React.CSSProperties | undefined>();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof CSS !== "undefined" &&
      CSS.supports?.("animation-timeline: view()")
    ) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = el.closest("figure");
    if (!root) return;

    const update = () => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      /* 0 while the figure sits below the fold; 1 once it has travelled
         well into the upper viewport. */
      const progress = Math.max(
        0,
        Math.min(1, (vh * 0.85 - rect.top) / (vh * 0.55 + rect.height * 0.35)),
      );

      const slot = 1 / (total + 0.4);
      const start = index * slot * 0.85;
      const end = start + slot;
      const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));

      setInline({
        opacity: t,
        transform: t >= 1 ? "none" : `translateY(${(1 - t) * 12}px)`,
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [index, total]);

  const step = 100 / (total + 0.35);
  const scrubStart = `${Math.round(index * step * 0.55)}%`;
  const scrubEnd = `${Math.round((index + 1) * step)}%`;

  return (
    <li
      ref={ref}
      className={cn("scrub-reveal", className)}
      style={
        {
          "--scrub-start": scrubStart,
          "--scrub-end": scrubEnd,
          ...inline,
        } as React.CSSProperties
      }
    >
      {children}
    </li>
  );
}
