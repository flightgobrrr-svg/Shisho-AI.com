import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Page not found" };

/** The 404: on-brand, and with a way back that is not the browser's button. */
export default function NotFound() {
  return (
    <Section>
      <Container>
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-4 max-w-2xl font-display text-title font-semibold">
          That page is not on the record.
        </h1>
        <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">
          The link may be old, or the address mistyped. Try one of these.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/">Go to the homepage</Button>
          <Button href="/library" variant="ghost">
            Legal Library
          </Button>
          <Button href="/draft-bot" variant="ghost">
            Shisho
          </Button>
        </div>
      </Container>
    </Section>
  );
}
