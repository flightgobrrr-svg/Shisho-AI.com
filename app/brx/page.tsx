import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "शिशो AI — भारतारि खान्थिनि थाखाय नोंनि AI गुरु",
  description:
    "भारतारि खान्थिनि थाखाय क्लासफोर आरो मोनसे AI मसौदा रांगोदै — कानूनारि पिपिलफोर, वकील जानाय गोनांथिफोर, आरो वकील खामानि खालामनायफोरनि थाखाय।",
  alternates: {
    canonical: "/brx",
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
 * The Bodo homepage — same additive Phase-1 pattern as /hi: app/page.tsx
 * (English) is untouched, every section component defaults to English when
 * no locale is passed, and this route just calls each with locale="brx". See
 * lib/i18n/dictionaries.ts's own header for what's deliberately NOT
 * translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageBodo() {
  return (
    <>
      <Hero locale="brx" />
      <MatterFlow locale="brx" />
      <FeatureStrip locale="brx" />
      <ProductShowcase locale="brx" />
      <PricingPreview locale="brx" />
      <FinalCta locale="brx" />
    </>
  );
}
