import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { EntryGate } from "@/components/motion/EntryGate";
import { Analytics } from "@vercel/analytics/next";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { HtmlLangSync } from "@/components/layout/HtmlLangSync";
import "./globals.css";

/**
 * Display — EB Garamond. Garamond set law and scholarship for centuries, so
 * the choice is justified by the subject rather than by trend. It matters
 * most for its italic: the brand tic (one italicised, seal-underlined word
 * per heading) is the single most-repeated gesture on the site, so the
 * display face needs a genuinely beautiful italic more than anything else.
 */
const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

/** Body/UI — distinctive at 14–17px, and deliberately not Inter or Roboto. */
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

/** Labels, case numbers, form numbers — the court-record voice. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const TITLE = "Shisho AI — Your AI legal mentor, built for Indian law";
const DESCRIPTION =
  "Courses and an AI drafting assistant for Indian law — for law students, aspiring lawyers, and practising advocates.";

export const metadata: Metadata = {
  /* Falls back to localhost rather than a domain that does not exist yet.
     Set NEXT_PUBLIC_SITE_URL at deploy time and OG/canonical URLs resolve. */
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · Shisho AI" },
  description: DESCRIPTION,
  applicationName: "Shisho AI",
  keywords: [
    "Indian law",
    "legal drafting",
    "law students",
    "Supreme Court of India",
    "legal education",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Shisho AI",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${garamond.variable} ${instrument.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Applies a stored theme override (see components/layout/
            ThemeToggle.tsx) before first paint, so a visitor who chose dark
            doesn't see a flash of the system/light default on their next
            visit. Runs synchronously, before anything below is painted — an
            unset preference is left alone entirely and the CSS
            `prefers-color-scheme` rule in app/globals.css handles that case
            with no JS at all. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("shisho-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}})();',
          }}
        />
        <HtmlLangSync />
        <a
          href="#main"
          className="sr-only rounded-seal focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-[14px] focus:text-paper"
        >
          Skip to content
        </a>
        <ChromeGate>
          <EntryGate />
          <CustomCursor />
          <Nav />
        </ChromeGate>
        <main id="main" className="flex-1">
          {children}
        </main>
        <ChromeGate>
          <Footer />
        </ChromeGate>
        <Analytics />
      </body>
    </html>
  );
}
