import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "ᱥᱤᱥᱳ AI — ᱦᱤᱱᱰ ᱚᱛᱱ ᱟᱭᱤᱱ ᱞᱟᱹᱜᱤᱛ ᱟᱢᱟᱜ AI ᱜᱩᱨᱩ",
  description:
    "ᱦᱤᱱᱰ ᱚᱛᱱ ᱟᱭᱤᱱ ᱞᱟᱹᱜᱤᱛ ᱠᱚᱨᱥ ᱟᱨ ᱢᱤᱫ AI ᱰᱨᱟᱯᱷᱴᱤᱝ ᱜᱚᱲᱚᱭᱤᱭᱟᱹ — ᱟᱭᱤᱱ ᱪᱮᱛᱟᱱ ᱪᱮᱟᱸᱰᱟᱜᱤᱡ, ᱦᱳᱴᱮᱭᱟᱜ ᱣᱚᱠᱤᱞ ᱠᱚ, ᱟᱨ ᱠᱟᱹᱢᱤ ᱨᱮ ᱛᱟᱦᱮᱸ ᱣᱚᱠᱤᱞ ᱠᱚ ᱞᱟᱹᱜᱤᱛ᱾",
  alternates: {
    canonical: "/sat",
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
 * The Santali (Ol Chiki) homepage — same additive Phase-1 pattern as /hi:
 * app/page.tsx (English) is untouched, every section component defaults to
 * English when no locale is passed, and this route just calls each with
 * locale="sat". See lib/i18n/dictionaries.ts's own header for what's
 * deliberately NOT translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageSantali() {
  return (
    <>
      <Hero locale="sat" />
      <MatterFlow locale="sat" />
      <FeatureStrip locale="sat" />
      <ProductShowcase locale="sat" />
      <PricingPreview locale="sat" />
      <FinalCta locale="sat" />
    </>
  );
}
