import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Headline, Notice, Screen, T } from "@/ui/components";
import { space } from "@/ui/theme";
import { apiConfigured } from "@/api/client";
import { ShishoChat } from "@/features/ShishoChat";
import { ShishoReview } from "@/features/ShishoReview";

/**
 * Shisho's drafting and review run on the website's service (a model call with
 * server-side keys, which a phone must never hold). When the build has no
 * service address, this tab says so plainly instead of showing a chat that
 * cannot answer.
 */
const HEARING_PROMPT = "Prepare me for my hearing. The matter is: ";

/**
 * Other screens can open this tab in a mode: ?mode=review for review, and
 * ?mode=hearing for a chat with a hearing-prep message already started. The
 * key remounts the tab only when that request changes, so tapping the tab
 * itself never clears a conversation.
 */
export default function ShishoTab() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return <ShishoTabBody key={mode ?? "default"} requested={mode} />;
}

function ShishoTabBody({ requested }: { requested?: string }) {
  const [mode, setMode] = useState<"draft" | "review">(requested === "review" ? "review" : "draft");

  if (!apiConfigured) {
    return (
      <Screen>
        <T v="label" tone="indigo">Shisho</T>
        <Headline text="Describe the facts, then have the draft *marked*." />
        <Notice
          title="Not connected in this build"
          body="Drafting, review and hearing prep run on Shisho's online service, and this build has no service address. It will not pretend."
        />
        <Card>
          <T v="h3">Meanwhile</T>
          <T v="small" tone="soft">
            The Documents tool shows what each pleading must contain and where it usually fails, the same standard Shisho marks against.
          </T>
          <Button label="Open Documents" variant="ghost" href="/documents" />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <T v="label" tone="indigo">Shisho</T>
      <Headline text="Describe the facts, then have the draft *marked*." />
      <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
        <Chip label="Draft with Shisho" selected={mode === "draft"} onPress={() => setMode("draft")} />
        <Chip label="Review a draft" selected={mode === "review"} onPress={() => setMode("review")} />
      </View>
      {mode === "draft" ? (
        <ShishoChat initialInput={requested === "hearing" ? HEARING_PROMPT : ""} />
      ) : (
        <ShishoReview />
      )}
    </Screen>
  );
}
