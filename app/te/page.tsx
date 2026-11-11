import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "శిషో AI — భారతీయ చట్టం కోసం మీ AI గురు",
  description:
    "భారతీయ చట్టం కోసం కోర్సులు మరియు AI డ్రాఫ్టింగ్ సహాయకుడు — న్యాయ విద్యార్థులు, భావి న్యాయవాదులు మరియు ప్రాక్టీసు చేస్తున్న అడ్వకేట్ల కోసం.",
  alternates: {
    canonical: "/te",
    languages: {
      "en-IN": "/", "hi-IN": "/hi", "bn-IN": "/bn", "mr-IN": "/mr", "te-IN": "/te",
      "ta-IN": "/ta", "gu-IN": "/gu", "kn-IN": "/kn", "ml-IN": "/ml",
    },
  },
};

/**
 * The Telugu homepage — same additive Phase-1 pattern as /hi: app/page.tsx
 * (English) is untouched, every section component defaults to English when
 * no locale is passed, and this route just calls each with locale="te". See
 * lib/i18n/dictionaries.ts's own header for what's deliberately NOT
 * translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageTelugu() {
  // `lang` in the server HTML, not only the client-side <html lang> fix, so
  // the script-specific type rules in globals.css (label font, heading wrap)
  // and screen readers have the right language from the first paint.
  return (
    <div lang="te-IN">
      <Hero locale="te" />
      <MatterFlow locale="te" />
      <FeatureStrip locale="te" />
      <ProductShowcase locale="te" />
      <PricingPreview locale="te" />
      <FinalCta locale="te" />
    </div>
  );
}
