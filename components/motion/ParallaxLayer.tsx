"use client";

import { useEffect, useRef } from "react";

/**
 * Drifts a layer against the scroll, centred on its own position so it sits
 * at rest when it is centred in the viewport and drifts either side of that
 * — it never accumulates offset down a long page.
 *
 * `speed` is small and signed. Anything past ~0.12 stops reading as depth and
 * starts reading as a slideshow, which is the failure mode this is meant to
 * avoid; the callers here sit at 0.05–0.08.
 *
 * Reduced motion is a hard opt-out, not a shortened duration: no listener is
 * attached at all and the child renders at its natural position, so there is
 * nothing to neutralise later.
 */
export function ParallaxLayer({
  speed,
  className,
  children,
}: {
  speed: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const write = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const fromCentre = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-fromCentre * speed).toFixed(1)}px, 0)`;
    };

    /* Coalesced to one write per frame — scroll fires far faster than the
       compositor can use the result. */
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
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
