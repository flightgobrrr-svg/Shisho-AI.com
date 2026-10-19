import { Row, Screen, T } from "@/ui/components";
import { apiConfigured } from "@/api/client";

/**
 * The app's own truth table. "Offline" works with no signal, from data bundled
 * in the app. "Live" needs a connection to Shisho's online service and works
 * only when this build has a service address. "Planned" is not built. Keep it
 * in step with what the app really does; it is the one place a reader can check.
 */
export default function WorksToday() {
  const online = apiConfigured ? "live" : "planned";
  const needs = apiConfigured ? "Needs a connection" : "This build is not connected to the online service";

  return (
    <Screen gap={4}>
      <T tone="soft">Shisho AI is pre-launch. This is the plain list of what this app does now and what it does not.</T>

      <T v="label" tone="indigo" style={{ marginTop: 12 }}>Works now, with no signal</T>
      <Row title="Limitation checker" detail="Twelve Articles and the written-statement period" status="offline" href="/limitation" />
      <Row title="IPC to BNS" detail="Seventeen verified mappings" status="offline" href="/ipc-bns" />
      <Row title="Documents and the Map" detail="Eleven pleadings, nine stages" status="offline" href="/documents" />
      <Row title="Advocate Clerks' manual" detail="Routine, manual, working formats" status="offline" href="/clerks" />
      <Row title="Moot kit, case-brief practice, revision" detail="Saved on this phone only" status="offline" href="/moot" />
      <Row title="Legal Library list" detail="Search the judgments; digests you open are saved for offline" status="offline" href="/library" />
      <Row title="Courses and classes" detail="What each course covers; recorded classes open in your video app" status="offline" href="/courses" />
      <Row title="Reminders" detail="Revision and next-date alerts, scheduled on this phone" status="offline" href="/next-dates" />

      <T v="label" tone="indigo" style={{ marginTop: 12 }}>Needs Shisho's online service</T>
      <Row title="Shisho: drafting, review, hearing prep, attach a file" detail={needs} status={online} href="/shisho" />
      <Row title="Library digests and judgment lookup" detail={needs} status={online} href="/library" />
      <Row title="Accounts and sign-in" detail={needs} status={online} href="/account" />

      <T v="label" tone="indigo" style={{ marginTop: 12 }}>Not in this app yet</T>
      <Row title="Voice dictation" detail="Needs a custom build of the app, not Expo Go" status="planned" />
      <Row title="Push notifications from Shisho" detail="Needs push credentials and a server sender" status="planned" />
      <Row title="Google Drive templates" detail="Not built" status="planned" />
      <Row title="Payments" detail="No online payment exists on the website either" status="planned" />
    </Screen>
  );
}
