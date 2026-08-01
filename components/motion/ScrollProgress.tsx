"use client";

import { useEffect, useRef } from "react";

/**
 * A seal hairline under the nav that fills as the page scrolls.
 *
 * This is the one piece of chrome that is about the subject rather than the
 * interface: the site is a mentor marking a document, and this is how far
 * down the document you have read. It adds no height — it draws over the
 * nav's existing bottom border.
 *
 * `scaleX` on a pre-sized bar rather than an animated `width`, so the whole
 * thing stays on the compositor and never triggers layout.
 *
 * Off under reduced motion, where a bar tracking a continuous gesture has no
 * honest still equivalent — the border simply stays as it was.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const write = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? doc.scrollTop / max : 0;
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    /* Coalesced to one write per frame. Scroll fires far faster than the
       compositor can use, and this runs on every page. */
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(write);
    };

    write();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /* `top-16` pins this to the bottom edge of the nav's 4rem bar rather than
     `bottom-0`, which would ride down to the foot of the expanded mobile
     panel. The sticky <header> is the containing block. */
  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="absolute inset-x-0 top-16 h-px origin-left bg-seal"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
