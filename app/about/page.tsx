import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legalPages";

export const metadata: Metadata = {
  title: LEGAL.about.title,
  description: LEGAL.about.lede,
};

export default function Page() {
  return <LegalPage doc={LEGAL.about} />;
}
