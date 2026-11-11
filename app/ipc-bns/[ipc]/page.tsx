import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { IPC_BNS, VERIFIED_ON, findIpcRow, ipcHeadline } from "@/lib/ipcBns";

export function generateStaticParams() {
  return IPC_BNS.map((r) => ({ ipc: r.ipc.toLowerCase() }));
}

const find = findIpcRow;
const headline = ipcHeadline;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ipc: string }>;
}): Promise<Metadata> {
  const { ipc } = await params;
  const row = find(ipc);
  if (!row) return {};
  return {
    title: headline(row.ipc, row.bns),
    description: `${row.offence}. ${
      row.bns
        ? `The Bharatiya Nyaya Sanhita section is ${row.bns}, for offences on or after 1 July 2024.`
        : "The Bharatiya Nyaya Sanhita carries no successor section."
    }`,
  };
}

export default async function IpcSectionPage({
  params,
}: {
  params: Promise<{ ipc: string }>;
}) {
  const { ipc } = await params;
  const row = find(ipc);
  if (!row) notFound();

  return (
    <Section>
      <Container>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: headline(row.ipc, row.bns),
            description: row.offence,
            about: "Indian Penal Code, 1860 and Bharatiya Nyaya Sanhita, 2023",
          }}
        />
        <Link
          href="/ipc-bns"
          className="underline-draw label-mono text-ink-soft transition-colors hover:text-ink"
        >
          IPC to BNS
        </Link>

        <Eyebrow className="mt-6">Indian Penal Code, 1860</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-title font-semibold">
          {headline(row.ipc, row.bns)}.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          {row.offence}.
        </p>

        <dl className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-ink/10 pt-8">
          <div>
            <dt className="label-mono text-indigo">IPC</dt>
            <dd className="mt-2 font-display text-[2rem] font-semibold text-ink">{row.ipc}</dd>
          </div>
          <div>
            <dt className="label-mono text-indigo">BNS</dt>
            <dd className="mt-2 font-display text-[2rem] font-semibold text-ink">
              {row.bns || "—"}
            </dd>
          </div>
        </dl>

        {row.note ? (
          <p className="mt-6 max-w-[60ch] border-l border-ink/25 pl-5 text-[14.5px] leading-relaxed text-ink-soft">
            {row.note}
          </p>
        ) : null}

        <p className="mt-8 max-w-[60ch] text-[14px] leading-relaxed text-ink-soft">
          The BNS applies to offences committed on or after 1 July 2024; earlier offences stay under
          the IPC even if the trial is later. Confirm the section against the Sanhita before you
          cite it.
        </p>

        <p className="mt-10 text-[13px] text-ink-soft">
          Two published tables agree on this row, checked {VERIFIED_ON}.{" "}
          <Link href="/ipc-bns" className="underline-draw text-ink">
            Look up another section
          </Link>
          . General information, not legal advice.
        </p>
      </Container>
    </Section>
  );
}
