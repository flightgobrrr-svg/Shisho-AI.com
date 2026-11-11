import { View } from "react-native";
import { useRouter } from "expo-router";
import { ChoiceCard, Screen, T } from "@/ui/components";
import { space } from "@/ui/theme";
import { PageHeader } from "@/ui/web";
import { EXAMS } from "@/lib/mockTests";
import { sittings } from "@/state/tools";

import { FadedPhoto } from "@/ui/FadedPhoto";
/**
 * Mock tests for CLAT, judicial services and court staff exams. Every
 * question is built from Shisho's verified data and names its source, so the
 * tests work with no signal and never teach something unchecked.
 */
export default function Tests() {
  const router = useRouter();
  const { value } = sittings.use();
  return (
    <Screen>
      <FadedPhoto source={require("../../../assets/screens/mock-tests.jpg")} height={180} />
      <PageHeader
        eyebrow="Mock tests"
        headline="Practise smart. Walk in *ready*."
        intro="Timed tests built only from verified provisions, judgments and procedure, with every answer explained and its source named. A new paper each time; your scores stay on this phone."
      />
      <View style={{ gap: space.md }}>
        {EXAMS.map((e) => {
          const mine = value.filter((s) => s.exam === e.id);
          const best = mine.length ? Math.max(...mine.map((s) => Math.round((s.score / s.total) * 100))) : null;
          return (
            <ChoiceCard
              key={e.id}
              title={e.name}
              detail={`${e.length} questions · ${e.minutes} minutes${best !== null ? ` · best ${best}% of ${mine.length} sitting${mine.length === 1 ? "" : "s"}` : ""}\n${e.blurb}`}
              onPress={() => router.push({ pathname: "/tests/[exam]", params: { exam: e.id } })}
            />
          );
        })}
      </View>
      <T v="small" tone="faint">
        Practice questions, not past papers. Each exam&apos;s official syllabus is wider than any practice set; use these alongside it.
      </T>
    </Screen>
  );
}
