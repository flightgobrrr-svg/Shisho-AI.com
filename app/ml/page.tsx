import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "ശിഷോ AI — ഇന്ത്യൻ നിയമത്തിനായി നിങ്ങളുടെ AI ഗുരു",
  description:
    "ഇന്ത്യൻ നിയമത്തിനായുള്ള കോഴ്സുകളും ഒരു AI ഡ്രാഫ്റ്റിംഗ് സഹായിയും — നിയമ വിദ്യാർത്ഥികൾക്കും, ഭാവി അഭിഭാഷകർക്കും, പ്രാക്ടീസ് ചെയ്യുന്ന അഭിഭാഷകർക്കും വേണ്ടി.",
  alternates: {
    canonical: "/ml",
    languages: {
      "en-IN": "/", "hi-IN": "/hi", "bn-IN": "/bn", "mr-IN": "/mr", "te-IN": "/te",
      "ta-IN": "/ta", "gu-IN": "/gu", "kn-IN": "/kn", "ml-IN": "/ml",
    },
  },
};

/**
 * The Malayalam homepage — same additive Phase-1 pattern as /hi: app/page.tsx
 * (English) is untouched, every section component defaults to English when
 * no locale is passed, and this route just calls each with locale="ml". See
 * lib/i18n/dictionaries.ts's own header for what's deliberately NOT
 * translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageMalayalam() {
  // `lang` in the server HTML, not only the client-side <html lang> fix, so
  // the script-specific type rules in globals.css (label font, heading wrap)
  // and screen readers have the right language from the first paint.
  return (
    <div lang="ml-IN">
      <Hero locale="ml" />
      <MatterFlow locale="ml" />
      <FeatureStrip locale="ml" />
      <ProductShowcase locale="ml" />
      <PricingPreview locale="ml" />
      <FinalCta locale="ml" />
    </div>
  );
}
