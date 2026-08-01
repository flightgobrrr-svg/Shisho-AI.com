import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DraftWorkspace } from "@/components/draft/DraftWorkspace";
import { PlanSwitcher } from "@/components/draft/PlanSwitcher";
import { Emphasis } from "@/components/ui/Emphasis";
import { PhotoBackdrop } from "@/components/ui/PhotoBackdrop";
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
    <Section className="relative overflow-hidden !pt-12 md:!pt-16">
      {/* A student on his feet, mid-question, with his teacher listening —
          which is precisely the transaction on this page.

          Held to a fixed band at the top rather than the section's full
          height. The workspace below is a 12.5px monospace textarea and a
          column of review notes; a photograph drifting behind either is a
          readability problem, not atmosphere. By the time the notes column
          starts, this has faded out completely.

          No `parallax` — see rule 2 in PhotoBackdrop. A fixed band at the top
          of a working page has nothing to gain from drift, and omitting it
          means no scroll listener is attached here at all.

          `lg` and up only. The mask fades leftward to about 26% of the frame,
          which clears the type column while the frame is the right-hand 56%.
          Full-bleed below `lg` it does not — it lands under the h1 — and there
          is no side column to move it into at that width, so it is dropped
          rather than allowed to sit behind text. Rule 1 is not negotiable. */}
      <PhotoBackdrop
        src="/gurukul-question.jpg"
        focus="52% 30%"
        mask="radial-gradient(54% 50% at 50% 32%, #000 20%, transparent 92%)"
        opacity={0.38}
        frameClassName="hidden lg:block top-0 right-0 h-[30rem] lg:w-[46%]"
      />

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
