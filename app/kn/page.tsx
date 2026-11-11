import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "ಶಿಶೋ AI — ಭಾರತೀಯ ಕಾನೂನಿಗಾಗಿ ನಿಮ್ಮ AI ಗುರು",
  description:
    "ಭಾರತೀಯ ಕಾನೂನಿಗಾಗಿ ಕೋರ್ಸ್‌ಗಳು ಮತ್ತು ಒಂದು AI ಡ್ರಾಫ್ಟಿಂಗ್ ಸಹಾಯಕ — ಕಾನೂನು ವಿದ್ಯಾರ್ಥಿಗಳು, ಭಾವಿ ವಕೀಲರು, ಮತ್ತು ಪ್ರಾಕ್ಟೀಸ್‌ನಲ್ಲಿರುವ ವಕೀಲರಿಗಾಗಿ.",
  alternates: {
    canonical: "/kn",
    languages: {
      "en-IN": "/", "hi-IN": "/hi", "bn-IN": "/bn", "mr-IN": "/mr", "te-IN": "/te",
      "ta-IN": "/ta", "gu-IN": "/gu", "kn-IN": "/kn", "ml-IN": "/ml",
    },
  },
};

/**
 * The Kannada homepage — same additive Phase-1 pattern as /hi: app/page.tsx
 * (English) is untouched, every section component defaults to English when
 * no locale is passed, and this route just calls each with locale="kn". See
 * lib/i18n/dictionaries.ts's own header for what's deliberately NOT
 * translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageKannada() {
  // `lang` in the server HTML, not only the client-side <html lang> fix, so
  // the script-specific type rules in globals.css (label font, heading wrap)
  // and screen readers have the right language from the first paint.
  return (
    <div lang="kn-IN">
      <Hero locale="kn" />
      <MatterFlow locale="kn" />
      <FeatureStrip locale="kn" />
      <ProductShowcase locale="kn" />
      <PricingPreview locale="kn" />
      <FinalCta locale="kn" />
    </div>
  );
}
