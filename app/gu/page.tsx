import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "શિશો AI — ભારતીય કાયદા માટે તમારો AI ગુરુ",
  description:
    "ભારતીય કાયદા માટે કોર્સ અને એક AI ડ્રાફ્ટિંગ સહાયક — કાયદાના વિદ્યાર્થીઓ, ભાવિ વકીલો, અને પ્રેક્ટિસ કરતા વકીલો માટે.",
  alternates: {
    canonical: "/gu",
    languages: {
      "en-IN": "/", "hi-IN": "/hi", "bn-IN": "/bn", "mr-IN": "/mr", "te-IN": "/te",
      "ta-IN": "/ta", "gu-IN": "/gu", "kn-IN": "/kn", "ml-IN": "/ml",
    },
  },
};

/**
 * The Gujarati homepage — same additive Phase-1 pattern as /hi: app/page.tsx
 * (English) is untouched, every section component defaults to English when
 * no locale is passed, and this route just calls each with locale="gu". See
 * lib/i18n/dictionaries.ts's own header for what's deliberately NOT
 * translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageGujarati() {
  // `lang` in the server HTML, not only the client-side <html lang> fix, so
  // the script-specific type rules in globals.css (label font, heading wrap)
  // and screen readers have the right language from the first paint.
  return (
    <div lang="gu-IN">
      <Hero locale="gu" />
      <MatterFlow locale="gu" />
      <FeatureStrip locale="gu" />
      <ProductShowcase locale="gu" />
      <PricingPreview locale="gu" />
      <FinalCta locale="gu" />
    </div>
  );
}
