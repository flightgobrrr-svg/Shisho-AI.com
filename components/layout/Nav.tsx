"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV } from "@/lib/nav";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Sticky nav gains a surface + hairline once the page has moved. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The panel closes on navigation via onClick on each link below, rather
     than an effect watching `pathname`. Closing in an effect would set state
     during render-commit and cascade an extra render on every route change. */

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  /* Escape to close, Tab trapped inside the panel, body scroll locked. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);

      // The trigger stays in the loop so Shift+Tab from the first link
      // reaches the close button rather than escaping to the page behind.
      const trigger = triggerRef.current;
      const loop = trigger ? [trigger, ...items] : items;
      if (loop.length === 0) return;

      const first = loop[0];
      const last = loop[loop.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Move focus into the panel so the keyboard path is continuous.
    const firstLink = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstLink?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const isActive = (href: string) =>
    !href.includes("#") && pathname === href;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
        scrolled || open
          ? "border-b border-ink/10 bg-paper-raised/95 backdrop-blur-sm"
          : "border-b border-transparent bg-paper",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-8">
        <Link
          href="/"
          className="rounded-seal"
          aria-label="Shisho AI — home"
        >
          <Logo />
        </Link>

        {/* Desktop */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "underline-draw text-[14px] transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                    isActive(link.href)
                      ? "text-ink"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Button href="/draft-bot" size="sm">
            Try free
          </Button>
        </div>

        {/* Mobile trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 inline-flex size-11 items-center justify-center rounded-seal text-ink lg:hidden"
        >
          <span aria-hidden="true" className="relative block h-3 w-5">
            <span
              className={cn(
                "absolute left-0 block h-px w-5 bg-current transition-transform duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                open ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-px w-5 bg-current transition-transform duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                open ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </span>
        </button>
      </div>

      <ScrollProgress />

      {/* Mobile panel */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="border-t border-ink/10 bg-paper-raised lg:hidden"
      >
        <nav aria-label="Primary" className="px-6 py-6">
          <ul className="space-y-1">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="block rounded-seal py-3"
                >
                  <span className="font-display text-[19px] text-ink">
                    {link.label}
                  </span>
                  {link.blurb ? (
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
                      {link.blurb}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          <Button
            href="/draft-bot"
            onClick={() => setOpen(false)}
            className="mt-6 w-full"
          >
            Try free
          </Button>
        </nav>
      </div>
    </header>
  );
}
