import type { Metadata } from "next";
import { DRAFT_TYPES, GROUNDS_SAMPLE, SHISHO_INTRO } from "@/lib/showcase";
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
import {
  readVisitorId,
  VISITOR_COOKIE,
  isSupabaseConfigured,
} from "@/lib/usageCounters";
import { getConnection } from "@/lib/driveConnection";

export const metadata: Metadata = {
  title: "Shisho",
  description:
    "Describe your facts and Shisho drafts the document — from the notice before suit to written arguments — then marks it up under Indian law.",
};

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
  const driveConnectError =
    typeof params.driveError === "string" ? params.driveError : null;

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <>
      {/* The chamber: in dark mode the one dark working surface on the site (see the
          CHAMBER block in app/globals.css). Everything inside re-themes
          through the scoped tokens; what the visitor writes on is paper
          (`.sheet`), what Shisho says sits on the slab. */}
      <section
        aria-labelledby="chamber-title"
        className="chamber relative isolate overflow-hidden bg-paper pt-14 pb-16 text-ink md:pt-20 md:pb-20"
      >
        {/* The teacher listening to a student's question, which is the
            transaction on this screen. On the dark slab it reads as a room
            lit from one side. `lg` and up only, masked to transparent well
            before the type column (PhotoBackdrop rule 1); below `lg` there is
            no side column for it, so it is dropped. */}
        <PhotoBackdrop
          src="/gurukul-question.jpg"
          focus="52% 30%"
          mask="radial-gradient(56% 52% at 60% 34%, #000 18%, transparent 88%)"
          opacity={0.38}
          frameClassName="hidden lg:block top-0 right-0 h-[34rem] lg:w-[48%]"
          sizes="(min-width: 1024px) 48vw, 1px"
        />

        <Container className="relative">
          <StageTrail product="draft-bot" />
          <h1
            id="chamber-title"
            className="mt-10 max-w-[12ch] font-display text-[3rem] leading-[0.98] font-semibold tracking-[-0.03em] text-balance sm:text-[4.25rem] lg:text-[5rem]"
          >
            What is the <Emphasis>matter</Emphasis>?
          </h1>
          <p className="mt-6 max-w-[34ch] font-display text-[1.35rem] leading-snug text-ink-soft italic sm:text-[1.55rem]">
            Describe the facts, then have the draft marked.
          </p>
          {target ? (
            <p className="label-mono mt-6 text-seal">
              Set up to draft: {target.name}
            </p>
          ) : null}
          <p className="mt-5 max-w-[56ch] text-[15.5px] leading-relaxed text-ink-faint">
            {SHISHO_INTRO}
          </p>

          <div className="mt-12 md:mt-14">
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
          </div>

          <p className="mt-14 max-w-[68ch] border-t border-ink/15 pt-5 text-[12.5px] leading-relaxed text-ink-faint">
            Shisho AI provides drafting assistance, not legal advice. What you
            type and attach is sent to an AI model provider to produce the
            response, and Shisho does not save it in its own database. Share
            only what you are authorised to, and leave out client names where
            you can.{" "}
            <Link href="/privacy" className="underline-draw text-ink">
              Privacy policy
            </Link>
          </p>
        </Container>
      </section>
      <Section id="drafts" tone="raised">
        <Container>
          <Eyebrow>What it drafts</Eyebrow>
          <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-3 font-display text-[17px] text-ink sm:grid-cols-2">
            {DRAFT_TYPES.map((item) => (
              <li
                key={item}
                className="border-b border-dotted border-ink/15 pb-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <Section className="!py-14 md:!py-16">
        <Container>
          <h2 className="max-w-xl font-display text-[1.5rem] font-semibold text-ink">
            Draft with precision. Argue with <Emphasis>authority</Emphasis>.
          </h2>
          <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
            <StatusList items={EXTRAS.advocates} />
            <SampleCard sample={GROUNDS_SAMPLE} />
          </div>
        </Container>
      </Section>
    </>
  );
}
