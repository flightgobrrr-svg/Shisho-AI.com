import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legalPages";

export const metadata: Metadata = {
  title: LEGAL.terms.title,
  description: LEGAL.terms.lede,
};

export default function Page() {
  return <LegalPage doc={LEGAL.terms} />;
}
