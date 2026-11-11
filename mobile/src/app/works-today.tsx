import { Headline, Row, Screen, T } from "@/ui/components";
import { SectionRule, StatusList } from "@/ui/web";
import { STATUS_LIVE, STATUS_PLANNED } from "@/lib/status";
import { apiConfigured } from "@/api/client";
import { APP_TOOLS, BUILT_IN_APP } from "@/features/appFeatures";
import { correctItems } from "@/features/sharedCopy";

/**
 * The website's /status, from the same lists (lib/status.ts): live, then
 * planned. The app has built some of what the website still plans
 * (features/appFeatures.ts); those move to "New in the app" here and leave the
 * planned list. After them, what works on this phone with no signal at all.
 */
const STILL_PLANNED = STATUS_PLANNED.filter((i) => !BUILT_IN_APP[i.label]);
export default function WorksToday() {
  return (
    <Screen>
      <T v="label" tone="indigo">Shisho AI</T>
      <Headline text="What works *today*." />
      <T tone="soft">Shisho AI is pre-launch. This is the plain list of what you can use now and what is still planned.</T>

      <T v="label" tone="indigo">Live</T>
      <StatusList items={correctItems(STATUS_LIVE)} />
      <T v="label" tone="indigo" style={{ marginTop: 16 }}>New in the app</T>
      {APP_TOOLS.filter((t) => t.href !== "/tools/saved").map((t) => (
        <Row key={t.label} title={t.label} detail={t.note} status={t.offline ? "offline" : "live"} href={t.href} />
      ))}
      <Row title="Buying a plan" detail="Razorpay, one month at a time. Android only for now" status="live" href="/pricing" />
      {STILL_PLANNED.length ? (
        <>
          <T v="label" tone="indigo" style={{ marginTop: 16 }}>Planned</T>
          <StatusList items={STILL_PLANNED} />
        </>
      ) : null}

      <SectionRule />
      <T v="label" tone="indigo">In this app, with no signal</T>
      <Row title="Limitation checker, IPC to BNS" detail="Bundled in the app" status="offline" href="/limitation" />
      <Row title="Documents, the Map, Formats, Bare Acts" detail="Bundled in the app" status="offline" href="/documents" />
      <Row title="Advocate Clerks' manual" detail="Bundled in the app" status="offline" href="/clerks" />
      <Row title="Moot kit, case-brief practice, revision" detail="Saved on this phone only" status="offline" href="/moot" />
      <Row title="Mock tests, Trace a doctrine, saved results" detail="Built from bundled, verified data" status="offline" href="/tests" />
      <Row title="Next-date reminders" detail="Alerts from the phone itself; installed builds only" status="offline" href="/next-dates" />
      <T v="small" tone="faint" style={{ marginTop: 12 }}>
        {apiConfigured
          ? "Shisho, judgment digests and accounts need a connection to Shisho's online service."
          : "This build has no online service, so Shisho, digests and accounts are off."}
      </T>
    </Screen>
  );
}
