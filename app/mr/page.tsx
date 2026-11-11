import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "शिशो AI — भारतीय कायद्यासाठी तुमचा AI गुरू",
  description:
    "भारतीय कायद्यासाठी अभ्यासक्रम आणि एक AI मसुदा सहाय्यक — कायद्याचे विद्यार्थी, होतकरू वकील आणि प्रॅक्टिस करणाऱ्या अधिवक्त्यांसाठी.",
  alternates: {
    canonical: "/mr",
    languages: {
      "en-IN": "/", "hi-IN": "/hi", "bn-IN": "/bn", "mr-IN": "/mr", "te-IN": "/te",
      "ta-IN": "/ta", "gu-IN": "/gu", "kn-IN": "/kn", "ml-IN": "/ml",
    },
  },
};

/**
 * The Marathi homepage — same additive Phase-1 pattern as /hi: app/page.tsx
 * (English) is untouched, every section component defaults to English when
 * no locale is passed, and this route just calls each with locale="mr". See
 * lib/i18n/dictionaries.ts's own header for what's deliberately NOT
 * translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageMarathi() {
  // `lang` in the server HTML, not only the client-side <html lang> fix, so
  // the script-specific type rules in globals.css (label font, heading wrap)
  // and screen readers have the right language from the first paint.
  return (
    <div lang="mr-IN">
      <Hero locale="mr" />
      <MatterFlow locale="mr" />
      <FeatureStrip locale="mr" />
      <ProductShowcase locale="mr" />
      <PricingPreview locale="mr" />
      <FinalCta locale="mr" />
    </div>
  );
}
