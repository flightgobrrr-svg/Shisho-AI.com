import type { Metadata } from "next";
import { Container, Eyebrow, Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Shisho AI.",
};

/**
 * The address comes from NEXT_PUBLIC_CONTACT_EMAIL rather than being written
 * here: this page must never show a mailbox nobody reads. Until the variable
 * is set it says so plainly.
 */
export default function ContactPage() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <Section>
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Shisho AI</Eyebrow>
          <h1 className="mt-4 font-display text-title font-semibold">Contact</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">
            Questions about the product, your account, your data or a refund.
          </p>

          <div className="mt-10 border-t border-ink/10 pt-8">
            {email ? (
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Write to{" "}
                <a
                  href={`mailto:${email}`}
                  className="underline-draw text-ink"
                >
                  {email}
                </a>
                . Say what the question is about and, for account requests,
                the email address on the account.
              </p>
            ) : (
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Contact details will appear here before launch.
              </p>
            )}
            <p className="mt-6 text-[13px] leading-relaxed text-ink-soft">
              Shisho AI cannot give legal advice by email either. For advice on
              your own matter, speak to an advocate.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
