import { useEffect, useState } from "react";
import { AccessibilityInfo, Image, View } from "react-native";
import { T } from "@/ui/components";
import { space } from "@/ui/theme";

const ANIMATED = require("../../assets/shisho-thinking.gif");
const STILL = require("../../assets/shisho-thinking-still.jpg");

/**
 * Shown while Shisho is drafting or reading: the glowing Shisho brain, with
 * the wait described underneath for anyone who can't see it. With the
 * phone's reduce-motion setting on, the brain is a still frame.
 */
export function ShishoThinking({ message }: { message: string }) {
  const [still, setStill] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setStill);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setStill);
    return () => sub.remove();
  }, []);
  return (
    <View style={{ alignItems: "center", gap: space.sm, paddingVertical: space.sm }}>
      <Image
        source={still ? STILL : ANIMATED}
        style={{ width: 160, height: 160, borderRadius: 12 }}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <T tone="soft" accessibilityLiveRegion="polite" style={{ textAlign: "center" }}>{message}</T>
    </View>
  );
}
