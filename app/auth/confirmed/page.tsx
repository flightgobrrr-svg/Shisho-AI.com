import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Email confirmed", robots: { index: false } };

/**
 * Where the confirmation link in a sign-up email from the mobile app lands.
 *
 * The app's sign-up runs on the server with no browser, so the link cannot
 * sign anyone in on the website (/auth/callback needs a code tied to the
 * browser that asked for it). It does not need to: Supabase confirms the
 * address before redirecting here. This page says so, and sends the person
 * back to the app instead of to a sign-in form with no explanation.
 */
export default function EmailConfirmed() {
  return (
    <Section>
      <Container>
        <Eyebrow>Account</Eyebrow>
        <h1 className="mt-4 max-w-2xl font-display text-title font-semibold">
          Your email is confirmed.
        </h1>
        <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft">
          Go back to the Shisho app and sign in with the email and password you chose.
          If the link did not work, it may have expired: create the account again from
          the app and use the newest email.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/login" variant="ghost">
            Sign in on the website instead
          </Button>
        </div>
      </Container>
    </Section>
  );
}
