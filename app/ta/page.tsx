import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "ஷிஷோ AI — இந்திய சட்டத்திற்கான உங்கள் AI குரு",
  description:
    "இந்திய சட்டத்திற்கான படிப்புகள் மற்றும் ஒரு AI வரைவு உதவியாளர் — சட்ட மாணவர்கள், வருங்கால வழக்கறிஞர்கள் மற்றும் பயிற்சியில் உள்ள வழக்கறிஞர்களுக்காக.",
  alternates: {
    canonical: "/ta",
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
 * The Tamil homepage — same additive Phase-1 pattern as /hi: app/page.tsx
 * (English) is untouched, every section component defaults to English when
 * no locale is passed, and this route just calls each with locale="ta". See
 * lib/i18n/dictionaries.ts's own header for what's deliberately NOT
 * translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageTamil() {
  return (
    <>
      <Hero locale="ta" />
      <MatterFlow locale="ta" />
      <FeatureStrip locale="ta" />
      <ProductShowcase locale="ta" />
      <PricingPreview locale="ta" />
      <FinalCta locale="ta" />
    </>
  );
}
