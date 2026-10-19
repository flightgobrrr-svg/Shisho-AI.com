import { Row, Screen, T, Disclaimer } from "@/ui/components";

export default function Tools() {
  return (
    <Screen gap={4}>
      <T v="label" tone="indigo">Works offline</T>
      <Row title="Limitation checker" detail="Twelve Articles and the written-statement period" href="/limitation" />
      <Row title="IPC to BNS" detail="Seventeen mappings two published tables agree on" href="/ipc-bns" />
      <Row title="Documents" detail="What each pleading must contain, and where it fails" href="/documents" />
      <Row title="The Map" detail="Every stage of a civil matter" href="/map" />
      <Row title="Next-date reminders" detail="A phone alert the day before a hearing" href="/next-dates" />
      <Row title="Advocate Clerks' manual" detail="Daily routine, A to Z entries, working formats" href="/clerks" />
      <T v="label" tone="indigo" style={{ marginTop: 16 }}>Needs a connection</T>
      <Row title="Legal Library" detail="The list works offline. Digests need a connection, and are saved once opened" href="/library" />
      <T v="small" tone="faint" style={{ marginTop: 16 }}>
        Each tool names its source and the date it was last checked.
      </T>
      <Disclaimer />
    </Screen>
  );
}
