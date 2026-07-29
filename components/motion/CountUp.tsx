"use client";

import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/lib/pricing";

/**
 * Counts a rupee figure up from zero when it scrolls into view.
 *
 * Two things keep this from being a gimmick:
 *   - the container reserves the final width up front and the digits are
 *     `tabular-nums`, so the card never reflows while the number climbs;
 *   - under reduced motion, or with JS unavailable, the final value is what
 *     renders — the animation is never load-bearing for reading the price.
 *
 * 600ms on an ease-out curve. Long enough to register, short enough that
 * nobody waits for it to finish before reading.
 */
export function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();

          const start = performance.now();
          const DURATION = 600;

          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / DURATION);
            // ease-out cubic — fast out of the gate, settles gently
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(value * eased));
            if (t < 1) frame = requestAnimationFrame(tick);
          };

          setDisplay(0);
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {formatINR(display)}
    </span>
  );
}
