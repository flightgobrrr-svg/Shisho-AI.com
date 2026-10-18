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
      "ta-IN": "/ta", "gu-IN": "/gu", "as-IN": "/as", "brx-IN": "/brx",
      "doi-IN": "/doi", "kn-IN": "/kn", "ks-Arab-IN": "/ks", "kok-IN": "/kok",
      "mai-IN": "/mai", "ml-IN": "/ml", "mni-Mtei-IN": "/mni", "ne-IN": "/ne",
      "or-IN": "/or", "pa-IN": "/pa", "sa-IN": "/sa", "sat-Olck-IN": "/sat",
      "sd-Deva-IN": "/sd", "ur-IN": "/ur",
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
  return (
    <>
      <Hero locale="gu" />
      <MatterFlow locale="gu" />
      <FeatureStrip locale="gu" />
      <ProductShowcase locale="gu" />
      <PricingPreview locale="gu" />
      <FinalCta locale="gu" />
    </>
  );
}
