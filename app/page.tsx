import { Hero } from "@/components/home/Hero";
import { MatterFlow } from "@/components/home/MatterFlow";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { PricingPreview } from "@/components/home/PricingPreview";
import { FinalCta } from "@/components/home/FinalCta";

/**
 * Landing page. A server component — the only client JS on this route is the
 * nav's mobile menu. Every layer of hero motion is CSS.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      {/* The matter's own sequence is the way in; the three products are
          introduced after it, as the things that answer those stages. */}
      <MatterFlow />
      <FeatureStrip />
      {/* Features described, then shown. */}
      <ProductShowcase />
      <PricingPreview />
      <FinalCta />
    </>
  );
}
