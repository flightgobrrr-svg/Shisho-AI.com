import { View } from "react-native";
import { Row, T } from "@/ui/components";
import { LIMITATION_ENTRIES, periodLabel } from "@/lib/limitation";
import { LimitationTool } from "@/features/LimitationTool";

/** The website's /limitation: the checker, then a page for each claim. */
export default function Limitation() {
  return (
    <LimitationTool
      photo={require("../../../assets/screens/limitation.jpg")}
      footer={
        <View style={{ marginTop: 16 }}>
          <T v="label" tone="indigo">Go straight to a claim</T>
          {LIMITATION_ENTRIES.map((e) => (
            <Row key={e.id} title={e.label} detail={`${e.article} · ${periodLabel(e.period)}`} href={`/limitation/${e.id}`} />
          ))}
        </View>
      }
    />
  );
}
