import { Hero } from "@/components/home/Hero";
import { RevisionDueBand } from "@/components/home/RevisionDueBand";
import { LookupBand } from "@/components/home/LookupBand";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { AudienceSections } from "@/components/home/AudienceSections";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { ClosingSection } from "@/components/home/ClosingSection";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

/**
 * Landing page. A server component — the only client JS on this route is the
 * nav's mobile menu. Every layer of hero motion is CSS.
 */
export default function HomePage() {
  return (
    <>
      <RevisionDueBand />
      <Hero />
      <LookupBand />
      {/* Who you are is now asked once, in the mandatory entry gate
          (components/motion/EntryGate.tsx) before this page is ever seen —
          see MatterFlow's own comment for what that means for this section. */}
      <MatterFlow />
      <FeatureStrip />
      {/* Features described, then shown. */}
      <ProductShowcase />
      <AudienceSections />
      <ClosingSection />
      <PricingPreview />
      <FinalCta />
    </>
  );
}
