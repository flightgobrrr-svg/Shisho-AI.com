"use client";

import { useEffect, useRef } from "react";

/**
 * A primary CTA that leans very slightly toward the cursor.
 *
 * Capped at 4px. The point is that the button feels alive under the hand, not
 * that anyone consciously notices it move — past about 6px this stops reading
 * as craft and starts reading as a showreel trick.
 *
 * Gated on `(pointer: fine)`, so it never runs on touch, where there is no
 * hover state to respond to and the transform would only fight the tap.
 * Disabled entirely under reduced motion.
 */
export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    const MAX = 4;
    const target = el.firstElementChild as HTMLElement | null;
    if (!target) return;

    target.style.transition =
      "transform var(--duration-nudge) var(--ease-precise)";

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const x = Math.max(-MAX, Math.min(MAX, (dx / rect.width) * MAX * 2));
      const y = Math.max(-MAX, Math.min(MAX, (dy / rect.height) * MAX * 2));
      target.style.transform = `translate(${x}px, ${y}px)`;
    };

    const onLeave = () => {
      target.style.transform = "translate(0, 0)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      target.style.transform = "";
    };
  }, []);

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
}
