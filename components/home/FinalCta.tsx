import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Section";
import { Emphasis } from "@/components/ui/Emphasis";
import { Magnetic } from "@/components/motion/Magnetic";
import { Spotlight } from "@/components/motion/Spotlight";

export function FinalCta() {
  return (
    <Section tone="ink" className="relative overflow-hidden">
      <Spotlight />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-2xl font-display text-title font-semibold text-paper">
          Put your draft in front of a{" "}
          <Emphasis className="decoration-accent-soft/80">mentor</Emphasis>.
        </h2>
        <p className="mx-auto mt-5 max-w-[44ch] text-[16px] leading-relaxed text-paper/70">
          Five free reviews a month. No card required, and nothing to install.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Button href="/draft-bot" size="lg">
              Try the Draft Bot
            </Button>
          </Magnetic>
          <Button
            href="/pricing"
            variant="ghost"
            size="lg"
            className="border-paper/25 text-paper hover:border-paper/45 hover:bg-paper/5"
          >
            See pricing
          </Button>
        </div>
      </Container>
    </Section>
  );
}
