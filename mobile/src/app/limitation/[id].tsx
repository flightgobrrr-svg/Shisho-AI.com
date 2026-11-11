import { Stack, useLocalSearchParams } from "expo-router";
import { Headline, Notice, Screen, T } from "@/ui/components";
import { LIMITATION_ENTRIES, VERIFIED_ON, periodLabel } from "@/lib/limitation";
import { LimitationTool } from "@/features/LimitationTool";

/** The website's /limitation/[id]: one claim, with the checker already set to it. */
export default function LimitationEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = LIMITATION_ENTRIES.find((e) => e.id === id);
  if (!entry) {
    return (
      <Screen>
        <Notice title="That claim is not in the checker" body="Go back and choose one from the list." />
      </Screen>
    );
  }
  return (
    <LimitationTool
      initialEntry={entry.id}
      header={
        <>
          <Stack.Screen options={{ title: entry.article }} />
          <T v="label" tone="indigo">{entry.article}</T>
          <Headline text={`Limitation for ${entry.label.toLowerCase()}.`} v="h2" />
          <T tone="soft">
            {entry.description} The period is {periodLabel(entry.period).toLowerCase()}, running from:{" "}
            {entry.runsFrom.charAt(0).toLowerCase() + entry.runsFrom.slice(1)}
          </T>
        </>
      }
      footer={<T v="small" tone="faint">Checked against {entry.source.name} on {VERIFIED_ON}.</T>}
    />
  );
}
