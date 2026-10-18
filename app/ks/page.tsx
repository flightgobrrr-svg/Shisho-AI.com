import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "شِشو AI — ہِندوستٲنؠ قانونَس خٲطرٕ توہند AI گورو",
  description:
    "ہِندوستٲنؠ قانونَس خٲطرٕ کورس تہٕ اکھ AI ڈرافٹنگ مددگار — قانونی طالب علماں، ہونہٕ وول وکیلاں، تہٕ پریکٹِس کرن واِلن وکیلاں خٲطرٕ۔",
  alternates: {
    canonical: "/ks",
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
 * The Kashmiri (Perso-Arabic/Nastaliq) homepage — same additive Phase-1
 * pattern as /hi: app/page.tsx (English) is untouched, every section
 * component defaults to English when no locale is passed, and this route
 * just calls each with locale="ks". <html dir> flips to rtl for this route
 * via components/layout/HtmlLangSync.tsx and lib/i18n/dictionaries.ts's
 * LOCALE_DIR map. See dictionaries.ts's own header for what's deliberately
 * NOT translated yet (the entry gate, Nav, Footer) and why.
 */
export default function HomePageKashmiri() {
  return (
    <>
      <Hero locale="ks" />
      <MatterFlow locale="ks" />
      <FeatureStrip locale="ks" />
      <ProductShowcase locale="ks" />
      <PricingPreview locale="ks" />
      <FinalCta locale="ks" />
    </>
  );
}
