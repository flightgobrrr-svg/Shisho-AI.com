import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DraftWorkspace } from "@/components/draft/DraftWorkspace";
import { PlanSwitcher } from "@/components/draft/PlanSwitcher";
import { Emphasis } from "@/components/ui/Emphasis";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import {
  entitlementFor,
  PLAN_COOKIE,
  readPlan,
  readUsage,
  USAGE_COOKIE,
} from "@/lib/entitlements";

export const metadata: Metadata = {
  title: "Draft Bot",
  description:
    "Paste a plaint, notice, application, or contract and get clause-level notes under Indian law.",
};

export default async function DraftBotPage() {
  const cookieStore = await cookies();

  const plan = readPlan(cookieStore.get(PLAN_COOKIE)?.value);
  const used = readUsage(cookieStore.get(USAGE_COOKIE)?.value);
  const entitlement = entitlementFor(plan, used);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <Section className="!pt-12 md:!pt-16">
      <Container>
        <Eyebrow>Draft Bot</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-[2rem] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[2.4rem]">
          Draft it, then have it <Emphasis>marked</Emphasis>.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft">
          Paste a draft and Shisho returns clause-level notes in the margin —
          the same way a senior hands back your work, with Indian authorities
          named where they apply.
        </p>

        <div className="mt-12">
          {isDev ? <PlanSwitcher plan={plan} /> : null}
          <DraftWorkspace entitlement={entitlement} />
        </div>
      </Container>
    </Section>
  );
}
