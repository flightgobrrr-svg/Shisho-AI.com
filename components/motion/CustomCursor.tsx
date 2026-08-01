"use client";

import { useEffect, useRef } from "react";

/**
 * A small seal-red ring that trails the pointer and grows over anything
 * clickable — the site's one cursor-wide signature.
 *
 * Gated the same way as `Magnetic`: `(pointer: fine)` and `prefers-reduced-
 * motion` are both checked before anything is attached, so a touch visitor or
 * a reduced-motion visitor never loses their native cursor to a ring that is
 * never drawn. The `data-custom-cursor` attribute is what hides the native
 * cursor, and it is only set once those checks pass — see `app/globals.css`,
 * which also keeps a real I-beam over text entry. Doing that in CSS rather
 * than by toggling `el.style.opacity` matters: `cursor` inherits, so hiding it
 * on `body` would otherwise take the caret away from the Draft Bot's textarea.
 *
 * The trail loop is NOT perpetual. It idles itself the moment the ring catches
 * up with the pointer and is restarted by the next `pointermove`, so a still
 * cursor costs nothing and the one-perpetual-animation budget stays with
 * AmbientDrift.
 *
 * Growth is a simple element-under-pointer check (`elementFromPoint`), not a
 * hover-listener-per-element scheme, so any button/link added later needs no
 * wiring here — only non-native interactive elements need an explicit
 * `data-cursor="grow"`.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;

    const draw = () => {
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };

    const tick = () => {
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;

      /* Settled — snap, drop the loop, and wait for the next move. */
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        pos.x = target.x;
        pos.y = target.y;
        draw();
        raf = 0;
        return;
      }

      pos.x += dx * 0.22;
      pos.y += dy * 0.22;
      draw();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;

      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const overText = !!hit?.closest("textarea, input, [contenteditable]");
      const grow = !!hit?.closest('[data-cursor="grow"], button, a');

      /* Over a text field the native I-beam takes over, so the ring would only
         be a second thing following the pointer. */
      el.style.opacity = overText ? "0" : "1";

      const size = grow ? 44 : 26;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
      el.style.backgroundColor = grow
        ? "color-mix(in srgb, var(--color-seal) 10%, transparent)"
        : "transparent";

      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* A ring parked against the window edge after the pointer has left reads
       as a stuck element rather than as a cursor. */
    const onLeave = () => {
      el.style.opacity = "0";
    };

    document.documentElement.setAttribute("data-custom-cursor", "");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      document.documentElement.removeAttribute("data-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 26,
        height: 26,
        margin: "-13px 0 0 -13px",
        border: "1px solid var(--color-seal)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0,
        transition:
          "opacity var(--duration-nudge) var(--ease-precise), " +
          "width var(--duration-nudge) var(--ease-precise), " +
          "height var(--duration-nudge) var(--ease-precise), " +
          "margin var(--duration-nudge) var(--ease-precise), " +
          "background-color var(--duration-nudge) var(--ease-precise)",
      }}
    />
  );
}
