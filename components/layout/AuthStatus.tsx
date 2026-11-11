"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/cn";

/**
 * Sign in / Register when logged out, or the account email + Sign out when
 * logged in — rendered in Nav's top bar and its mobile panel.
 *
 * Fetches GET /api/auth/session on mount rather than reading the session
 * cookie directly: this app has no browser-side Supabase client and the
 * session cookie is httpOnly by design (lib/authSession.ts), so a server
 * round trip is the only way a client component learns this. Undefined
 * (still loading) renders nothing rather than flashing "Sign in" for a
 * visitor who turns out to be logged in.
 */
export function AuthStatus({ variant = "bar" }: { variant?: "bar" | "panel" }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setEmail(data?.email ?? null);
      })
      .catch(() => {
        if (!cancelled) setEmail(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (email === undefined) return null;

  const linkClass =
    variant === "bar"
      ? "text-[13px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:text-ink"
      : "text-[14.5px] text-ink";

  // The panel variant owns its own divider/spacing so it collapses to
  // nothing (not an empty bordered box) while `email` is still loading.
  const wrapperClass =
    variant === "bar"
      ? "hidden items-center lg:flex"
      : "mb-5 flex items-center border-b border-ink/10 pb-5";

  if (!email) {
    return (
      <div className={cn(wrapperClass, "gap-4")}>
        <Link href="/login" className={linkClass}>
          Sign in
        </Link>
        <Link href="/register" className={linkClass}>
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(wrapperClass, variant === "panel" && "justify-between", "gap-3")}>
      <Link href="/account" className={cn("min-w-0 truncate", linkClass)}>
        {email}
      </Link>
      <SignOutButton />
    </div>
  );
}
