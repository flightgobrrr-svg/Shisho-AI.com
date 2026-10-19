import { Row, Screen, T } from "@/ui/components";
import { dueCount, revisionStore } from "@/state/stores";

export default function Learn() {
  const { value: cards } = revisionStore.use();
  const due = dueCount(cards);

  return (
    <Screen gap={4}>
      <T v="label" tone="indigo">For law students</T>
      <Row
        title="Revision"
        detail={due > 0 ? `${due} due now` : "Saved briefs return after 1, 7 and 30 days"}
        status="offline"
        href="/revision"
      />
      <Row title="Case-brief practice" detail="Write facts, issue, held and ratio, then read the judgment" status="offline" href="/case-brief" />
      <Row title="Moot kit" detail="Memorial outline, oral-round timer, your own rules" status="offline" href="/moot" />
      <Row title="Courses and classes" detail="Starter and Proficient, Legal English, Spoken English" href="/courses" />
      <T v="small" tone="faint" style={{ marginTop: 16 }}>
        What you save stays on this phone. Clearing the app's data removes it.
      </T>
    </Screen>
  );
}
