import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { DraftWorkspace } from "@/components/draft/DraftWorkspace";
import { PlanSwitcher } from "@/components/draft/PlanSwitcher";
import { SampleCard } from "@/components/for/SampleCard";
import { StatusList } from "@/components/for/StatusList";
import { Emphasis } from "@/components/ui/Emphasis";
import { EXTRAS } from "@/lib/audiencePages";
import { PhotoBackdrop } from "@/components/ui/PhotoBackdrop";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { StageTrail } from "@/components/map/StageTrail";
import { getDocument } from "@/lib/documents";
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
import { readVisitorId, VISITOR_COOKIE, isSupabaseConfigured } from "@/lib/usageCounters";
import { getConnection } from "@/lib/driveConnection";

export const metadata: Metadata = {
  title: "Shisho",
  description:
    "Describe your facts and Shisho drafts the document — from the notice before suit to written arguments — then marks it up under Indian law.",
};

const DRAFT_TYPES = [
  "Plaints, written statements & rejoinders",
  "Interim applications & stay drafts",
  "Bail applications under the BNSS",
  "Legal notices & replies",
  "Writ petitions under Articles 226 & 32",
  "Synopsis, list of dates & grounds of appeal",
];

export default async function DraftBotPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [cookieStore, params] = await Promise.all([cookies(), searchParams]);

  /* ?doc=<slug> arrives from a document page's "Draft this with Shisho".

     Resolved HERE, on the server, against lib/documents.ts — so the query
     string never reaches the workspace as a document type. An unknown slug,
     a hand-edited one, or one naming a document that is not drafted at all
     resolves to nothing and the page falls back to its default. */
  const requested =
    typeof params.doc === "string" ? getDocument(params.doc) : undefined;
  const target = requested?.draftsAs
    ? { docType: requested.draftsAs, name: requested.name }
    : null;

  /* ?mode=review arrives from the nav's "Review a draft" dropdown item
     (lib/nav.ts). Resolved here rather than read from the URL hash on the
     client: a hash is never sent to the server at all, so deciding the
     workspace's initial tab from one meant guessing on the first client
     render and then correcting it — which is exactly the server/client
     mismatch a hard reload of /draft-bot#review hit. A query string doesn't
     have that problem; it's just as available during SSR as during
     hydration, so the right tab renders correct the first time. */
  const initialMode = params.mode === "review" ? "review" : "new";

  const plan = readPlan(cookieStore.get(PLAN_COOKIE)?.value);
  const used = readUsage(cookieStore.get(USAGE_COOKIE)?.value);
  const entitlement = entitlementFor(plan, used);

  const assistantUsed = readAssistantUsage(
    cookieStore.get(ASSISTANT_USAGE_COOKIE)?.value,
  );
  const assistantEntitlement = assistantEntitlementFor(plan, assistantUsed);

  /* Google Drive connection state — resolved here, same discipline as
     entitlement/assistantEntitlement above: the server reads what it can
     from the visitor_id cookie and passes plain values down, the client
     seeds local state from them once. Deliberately does NOT mint a fresh
     visitor_id when the cookie is absent — cookies() is read-only in a
     Server Component, minting one here would need a .set() this page has
     no way to perform, and a visitor with no cookie yet has no connection
     to look up regardless. */
  const visitorCookieValue = cookieStore.get(VISITOR_COOKIE)?.value;
  const driveConnection =
    isSupabaseConfigured() && visitorCookieValue
      ? await getConnection(readVisitorId(visitorCookieValue))
      : null;

  const driveConnected = !!driveConnection;
  const driveTemplateName = driveConnection?.templateName ?? null;
  const driveFiles = driveConnection?.files ?? [];
  const driveJustConnected = params.driveConnected === "1";
  const driveConnectError = typeof params.driveError === "string" ? params.driveError : null;

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
        {target ? (
          <p className="label-mono mt-6 text-ink-soft">
            Set up to draft: {target.name}
          </p>
        ) : null}
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
            initialDocType={target?.docType}
            initialMode={initialMode}
            driveConnected={driveConnected}
            driveTemplateName={driveTemplateName}
            driveFiles={driveFiles}
            driveJustConnected={driveJustConnected}
            driveConnectError={driveConnectError}
          />
          <p className="mt-6 max-w-[62ch] text-[13px] leading-relaxed text-ink-soft">
            What you type and attach is sent to an AI model provider to produce
            the response, and Shisho does not save it in its own database. Share
            only what you are authorised to, and leave out client names where
            you can.{" "}
            <Link href="/privacy" className="underline-draw text-ink">
              Privacy policy
            </Link>
          </p>
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
    <Section className="border-t border-ink/10 !py-14 md:!py-16">
      <Container>
        <Eyebrow>For advocates</Eyebrow>
        <h2 className="mt-4 max-w-xl font-display text-[1.5rem] font-semibold text-ink">
          Draft with precision. Argue with <Emphasis>authority</Emphasis>.
        </h2>
        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <StatusList items={EXTRAS.advocates} />
          <SampleCard
            sample={{
              label: "Memorandum of grounds",
              rows: [
                { term: "Ground 1", detail: "Authority beside it" },
                { term: "Ground 2", detail: "Authority beside it" },
                { term: "Ground 3", detail: "Authority beside it" },
              ],
            }}
          />
        </div>
      </Container>
    </Section>
    </>
  );
}
