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

        {/* Desktop.

            The dropdowns are pure CSS — `group-hover` for the pointer and
            `group-focus-within` for the keyboard, so there is no open-menu
            state to manage and nothing to get stuck open on a route change.
            The panel is a ruled box like every other box on the site, and it
            fades and settles 4px with the standard nudge; the reduced-motion
            backstop in globals.css collapses that to an instant swap.

            The panel's wrapper carries `pt-2` rather than a margin so the gap
            between trigger and panel is still inside the hover target — with
            a margin the menu closes as the pointer crosses the gap. */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href} className="group relative">
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

                {link.children && link.children.length > 0 && (
                  <div
                    className={cn(
                      "invisible absolute top-full left-1/2 z-10 -translate-x-1/2 pt-5 opacity-0",
                      "transition-[opacity,transform] duration-[var(--duration-nudge)] ease-[var(--ease-precise)]",
                      "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
                      "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
                      "-translate-y-1",
                    )}
                  >
                    <ul className="w-72 border border-ink/45 bg-paper-raised p-2 shadow-[0_18px_44px_-16px_rgba(34,37,43,0.28)]">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block px-3 py-2.5 transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:bg-paper"
                          >
                            <span className="block text-[14px] text-ink">
                              {child.label}
                            </span>
                            {child.blurb && (
                              <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-soft">
                                {child.blurb}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

                {/* Inline rather than a nested disclosure: there is no hover
                    on touch, and a tap-to-expand would put a second tap
                    between someone and the thing they came for. The rule and
                    indent carry the nesting instead. */}
                {link.children && link.children.length > 0 && (
                  <ul className="mb-2 ml-1 border-l border-ink/15 pl-4">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-[14.5px] text-ink-soft"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
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
