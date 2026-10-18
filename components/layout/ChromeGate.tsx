"use client";

import { usePathname } from "next/navigation";

/**
 * Hides its children on /admin routes — the internal review tool gets none
 * of the marketing chrome (mandatory splash/audience picker, public nav,
 * footer, custom cursor).
 *
 * Deliberately a client-side pathname check, not a server one. The obvious
 * alternative — read the pathname in the root layout via headers() — would
 * work, but headers() is a request-time API that opts EVERY route using it
 * into dynamic rendering (see next/headers docs). Root layout wraps every
 * page in the app, so that one call would silently take the whole site off
 * static generation to gate three admin pages. usePathname() in a Client
 * Component costs nothing at build time: for a static page, Next already
 * knows that page's own path when it prerenders it.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
