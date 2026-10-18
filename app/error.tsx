"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

/**
 * Shown when a page throws while rendering. The visitor gets a plain message
 * and a way to retry, and the error is logged for whoever runs the service —
 * hook an error-tracking service in here (it receives `error`) once one is
 * chosen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page error]", error);
  }, [error]);

  return (
    <Section>
      <Container>
        <Eyebrow>Something went wrong</Eyebrow>
        <h1 className="mt-4 max-w-2xl font-display text-title font-semibold">
          That page did not load.
        </h1>
        <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">
          It is on our side, not yours. Anything you typed on this page may not have been kept.
          Try again, or go back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="ghost">
            Go to the homepage
          </Button>
        </div>
      </Container>
    </Section>
  );
}
