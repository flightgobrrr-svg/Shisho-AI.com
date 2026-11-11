import { useState } from "react";
import { View } from "react-native";
import { Button, Notice, Row, Screen, T, TextButton } from "@/ui/components";
import { space } from "@/ui/theme";
import { ToolOutputView, toolText } from "@/features/ToolResults";
import { removeResult, savedResults } from "@/state/tools";
import { shareText } from "@/ui/share";
import { TOOL_TITLES } from "@/lib/toolTypes";

/** Everything saved from the Shisho tools. Kept on this phone only; opens with no signal. */
export default function Saved() {
  const { value, ready } = savedResults.use();
  const [open, setOpen] = useState<string | null>(null);
  const item = value.find((r) => r.id === open);

  if (item) {
    return (
      <Screen>
        <TextButton label="‹ All saved results" onPress={() => setOpen(null)} />
        <T v="label" tone="indigo">
          {TOOL_TITLES[item.tool]} · {new Date(item.savedAt).toLocaleDateString("en-IN")}
        </T>
        <ToolOutputView result={item.result} />
        <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
          <Button label="Share" variant="ghost" onPress={() => shareText(toolText(item.result))} />
          <Button
            label="Delete"
            variant="ghost"
            onPress={() => {
              removeResult(item.id);
              setOpen(null);
            }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen gap={4}>
      <T v="label" tone="indigo">On this phone</T>
      <T v="h2">Saved results</T>
      {ready && value.length === 0 ? (
        <Notice title="Nothing saved yet" body="Run a tool and tap Save. Saved results open here with no signal." />
      ) : null}
      {value.map((r) => (
        <Row
          key={r.id}
          title={r.title}
          detail={`${TOOL_TITLES[r.tool]} · ${new Date(r.savedAt).toLocaleDateString("en-IN")}`}
          onPress={() => setOpen(r.id)}
        />
      ))}
    </Screen>
  );
}
