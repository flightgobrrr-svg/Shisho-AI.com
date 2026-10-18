import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { IpcBnsLookup } from "@/components/tools/IpcBnsLookup";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { VERIFIED_ON } from "@/lib/ipcBns";

export const metadata: Metadata = {
  title: "IPC to BNS",
  description:
    "Find the Bharatiya Nyaya Sanhita section that replaced a common Indian Penal Code section.",
};

export default function IpcBnsPage() {
  return (
    <Section>
      <Container>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "IPC to BNS lookup",
            applicationCategory: "LegalService",
            description: "Find the Bharatiya Nyaya Sanhita section for a common IPC section.",
            isAccessibleForFree: true,
          }}
        />
        <Eyebrow>Bharatiya Nyaya Sanhita, 2023</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          The old section, the <Emphasis>new</Emphasis> number.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          The BNS replaced the IPC for offences committed on or after 1 July
          2024; earlier offences stay under the IPC. Numbers did not carry
          over, so citing &ldquo;302&rdquo; can now point to the wrong offence.
        </p>

        <div className="mt-12 border-t border-ink/10 pt-10">
          <IpcBnsLookup />
        </div>

        <div className="mt-14 max-w-[64ch] space-y-3 text-[13px] leading-relaxed text-ink-soft">
          <p>
            This list holds only mappings that two published conversion tables
            agree on, so it is short on purpose. Some offences are left out
            because the tables disagree, for example rape (IPC 376). Confirm
            any entry against the Bureau of Police Research and Development&rsquo;s
            correspondence table or the Sanhita itself before you cite it.
          </p>
          <p>
            Sources:{" "}
            <a href="https://lawsikho.com/blog/ipc-to-bns-conversion" rel="noopener noreferrer" className="underline-draw text-ink">
              LawSikho
            </a>
            ,{" "}
            <a href="https://vakeel360.com/ipc-to-bns" rel="noopener noreferrer" className="underline-draw text-ink">
              Vakeel360
            </a>
            . Checked {VERIFIED_ON}. General information, not legal advice.
          </p>
        </div>
      </Container>
    </Section>
  );
}
