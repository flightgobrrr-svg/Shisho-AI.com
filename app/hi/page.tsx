import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "शिशो AI — भारतीय कानून के लिए आपका AI गुरु",
  description:
    "भारतीय कानून के लिए कोर्स और एक AI ड्राफ्टिंग सहायक — विधि छात्रों, भावी वकीलों, और प्रैक्टिसिंग अधिवक्ताओं के लिए।",
  alternates: {
    canonical: "/hi",
    languages: {
      "en-IN": "/", "hi-IN": "/hi", "bn-IN": "/bn", "mr-IN": "/mr", "te-IN": "/te",
      "ta-IN": "/ta", "gu-IN": "/gu", "kn-IN": "/kn", "ml-IN": "/ml",
    },
  },
};

/**
 * The Hindi homepage — Phase 1 of the language feature named in the hero,
 * additive rather than a restructure: app/page.tsx (English) is completely
 * untouched, every section component still defaults to English when no
 * locale is passed, and this route just calls each with locale="hi". See
 * lib/i18n/dictionaries.ts's own header for what's deliberately NOT
 * translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageHindi() {
  // `lang` in the server HTML, not only the client-side <html lang> fix, so
  // the script-specific type rules in globals.css (label font, heading wrap)
  // and screen readers have the right language from the first paint.
  return (
    <div lang="hi-IN">
      <Hero locale="hi" />
      <MatterFlow locale="hi" />
      <FeatureStrip locale="hi" />
      <ProductShowcase locale="hi" />
      <PricingPreview locale="hi" />
      <FinalCta locale="hi" />
    </div>
  );
}
