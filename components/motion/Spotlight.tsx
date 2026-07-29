"use client";

import { useEffect, useRef } from "react";

/**
 * A very low-opacity warm glow that follows the pointer across the dark
 * closing section.
 *
 * Damped with a lerp so it trails the cursor slightly rather than snapping to
 * it — an undamped follow reads as a cheap cursor toy; a trailing one reads
 * as light falling across a surface.
 *
 * Writes to a CSS custom property rather than restyling on every frame, so
 * the browser only ever recomputes the gradient. `(pointer: fine)` only, and
 * off entirely under reduced motion — the section is perfectly legible
 * without it.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    let targetX = 50;
    let targetY = 50;
    let x = 50;
    let y = 50;
    let frame = 0;
    let active = false;

    const onMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 100;
      targetY = ((event.clientY - rect.top) / rect.height) * 100;
      if (!active) {
        active = true;
        el.style.opacity = "1";
        frame = requestAnimationFrame(loop);
      }
    };

    const loop = () => {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      el.style.setProperty("--x", `${x}%`);
      el.style.setProperty("--y", `${y}%`);
      frame = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      active = false;
      cancelAnimationFrame(frame);
      el.style.opacity = "0";
    };

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), color-mix(in srgb, var(--color-accent-soft) 14%, transparent), transparent 70%)",
      }}
    />
  );
}
