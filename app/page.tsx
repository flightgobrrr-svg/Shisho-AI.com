import { Hero } from "@/components/home/Hero";
import { PersonaRouter } from "@/components/home/PersonaRouter";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { SocialProof } from "@/components/home/SocialProof";
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
      <PersonaRouter />
      <FeatureStrip />
      {/* Features described, then shown, then vouched for. */}
      <ProductShowcase />
      <SocialProof />
      <PricingPreview />
      <FinalCta />
    </>
  );
}
