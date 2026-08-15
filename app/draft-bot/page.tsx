import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DraftWorkspace } from "@/components/draft/DraftWorkspace";
import { PlanSwitcher } from "@/components/draft/PlanSwitcher";
import { Emphasis } from "@/components/ui/Emphasis";
import { PhotoBackdrop } from "@/components/ui/PhotoBackdrop";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { StageTrail } from "@/components/map/StageTrail";
import {
  entitlementFor,
  PLAN_COOKIE,
  readPlan,
  readUsage,
  USAGE_COOKIE,
} from "@/lib/entitlements";
import {
  assistantEntitlementFor,
  ASSISTANT_USAGE_COOKIE,
  readAssistantUsage,
} from "@/lib/assistantEntitlements";

export const metadata: Metadata = {
  title: "Shisho",
  description:
    "Describe your facts and Shisho drafts a plaint, notice, application, or contract — then marks it up under Indian law.",
};

const DRAFT_TYPES = [
  "Plaints, written statements & rejoinders",
  "Interim applications & stay drafts",
  "Bail applications under the BNSS",
  "Legal notices & replies",
  "Writ petitions under Articles 226 & 32",
  "Synopsis, list of dates & grounds of appeal",
];

export default async function DraftBotPage() {
  const cookieStore = await cookies();

  const plan = readPlan(cookieStore.get(PLAN_COOKIE)?.value);
  const used = readUsage(cookieStore.get(USAGE_COOKIE)?.value);
  const entitlement = entitlementFor(plan, used);

  const assistantUsed = readAssistantUsage(
    cookieStore.get(ASSISTANT_USAGE_COOKIE)?.value,
  );
  const assistantEntitlement = assistantEntitlementFor(plan, assistantUsed);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <>
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
        <Eyebrow>Shisho</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-[2rem] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[2.4rem]">
          Describe the facts, then have the draft <Emphasis>marked</Emphasis>.
        </h1>
        <StageTrail product="draft-bot" className="mt-6" />
        <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft">
          Tell Shisho the facts and attach a file if you have one — it drafts
          the document, then marks it up in the margin the same way a senior
          hands back your work, with Indian authorities named where they
          apply.
        </p>

        <div className="mt-12">
          {isDev ? <PlanSwitcher plan={plan} /> : null}
          <DraftWorkspace
            entitlement={entitlement}
            assistantEntitlement={assistantEntitlement}
          />
        </div>
      </Container>
    </Section>
    <Section id="drafts" tone="raised" className="border-t border-ink/10">
      <Container>
        <Eyebrow>What it drafts</Eyebrow>
        <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-3 font-display text-[17px] text-ink sm:grid-cols-2">
          {DRAFT_TYPES.map((item) => (
            <li key={item} className="border-b border-dotted border-ink/15 pb-3">
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
    </>
  );
}
