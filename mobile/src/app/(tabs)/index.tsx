import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Card, Headline, Row, Screen, T, Button } from "@/ui/components";
import { dueCount, revisionStore, welcomeStore } from "@/state/stores";
import { apiConfigured } from "@/api/client";
import { AUDIENCE_GROUPS } from "@/lib/nav";

export default function Home() {
  const router = useRouter();
  const { value: welcome } = welcomeStore.use();
  const { value: cards } = revisionStore.use();
  const due = dueCount(cards);

  // The welcome screen is offered once, never forced: it has a Skip.
  useEffect(() => {
    if (!welcome.seen) router.push("/welcome");
  }, [welcome.seen, router]);

  return (
    <Screen>
      <T v="label" tone="indigo">For Indian law</T>
      <Headline text="Every great lawyer had a *shisho*." />
      <T tone="soft">
        Verified tools for Indian law that work without a signal: limitation, IPC to BNS, and a
        reference for every court document.
      </T>

      {due > 0 ? (
        <Card>
          <T v="h3">{due === 1 ? "1 case brief is due" : `${due} case briefs are due`}</T>
          <T v="small" tone="soft">Revision keeps what you read.</T>
          <Button label="Revise now" href="/revision" variant="dark" />
        </Card>
      ) : null}

      <T v="label" tone="faint" style={{ marginTop: 8 }}>Try first</T>
      <Row title="Check a limitation date" detail="Last day to file, from the Act's Schedule" status="offline" href="/limitation" />
      <Row title="IPC to BNS" detail="Find the new section for an old one" status="offline" href="/ipc-bns" />
      <Row title="What a document must contain" detail="Eleven pleadings, with the provision for each" status="offline" href="/documents" />
      <Row title="Look up a judgment" detail={apiConfigured ? "Type a case name and read a digest. Needs a connection and sign-in" : "Not connected in this build"} status={apiConfigured ? "live" : "planned"} href="/library/lookup" />
      <Row title="Ask Shisho" detail={apiConfigured ? "Drafting, review and hearing prep. Needs a connection" : "Drafting and review. Not connected in this build"} status={apiConfigured ? "live" : "planned"} href="/shisho" />

      <T v="label" tone="faint" style={{ marginTop: 8 }}>Who it&apos;s for</T>
      {AUDIENCE_GROUPS.map((group) => (
        <Row
          key={group.heading}
          title={group.heading}
          detail={group.links.map((l) => l.label).join(" · ")}
          href={{ pathname: "/for", params: { group: group.heading } }}
        />
      ))}

      <Row title="What works today" detail="Live, offline and planned, in one list" href="/works-today" />
    </Screen>
  );
}
