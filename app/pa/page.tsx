import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "ਸ਼ਿਸ਼ੋ AI — ਭਾਰਤੀ ਕਾਨੂੰਨ ਲਈ ਤੁਹਾਡਾ AI ਗੁਰੂ",
  description:
    "ਭਾਰਤੀ ਕਾਨੂੰਨ ਲਈ ਕੋਰਸ ਅਤੇ ਇੱਕ AI ਡਰਾਫਟਿੰਗ ਸਹਾਇਕ — ਕਾਨੂੰਨ ਦੇ ਵਿਦਿਆਰਥੀਆਂ, ਭਵਿੱਖ ਦੇ ਵਕੀਲਾਂ, ਅਤੇ ਪ੍ਰੈਕਟਿਸ ਕਰ ਰਹੇ ਵਕੀਲਾਂ ਲਈ।",
  alternates: {
    canonical: "/pa",
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
 * The Punjabi (Gurmukhi) homepage — same additive Phase-1 pattern as /hi:
 * app/page.tsx (English) is untouched, every section component defaults to
 * English when no locale is passed, and this route just calls each with
 * locale="pa". See lib/i18n/dictionaries.ts's own header for what's
 * deliberately NOT translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePagePunjabi() {
  return (
    <>
      <Hero locale="pa" />
      <MatterFlow locale="pa" />
      <FeatureStrip locale="pa" />
      <ProductShowcase locale="pa" />
      <PricingPreview locale="pa" />
      <FinalCta locale="pa" />
    </>
  );
}
