import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Headline, Notice, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { SampleCard, SectionRule, StageTrail, StatusList } from "@/ui/web";
import { DRAFT_TYPES, GROUNDS_SAMPLE, SHISHO_INTRO } from "@/lib/showcase";
import { EXTRAS } from "@/lib/audiencePages";
import { apiConfigured } from "@/api/client";
import { ShishoChat } from "@/features/ShishoChat";
import { ShishoReview } from "@/features/ShishoReview";
import { seedMessage, takeDraftSeed } from "@/state/draftSeed";
import { getDocument } from "@/lib/documents";
import type { DocType } from "@/lib/draft";

import { FadedPhoto } from "@/ui/FadedPhoto";
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
  const { mode, doc } = useLocalSearchParams<{ mode?: string; doc?: string }>();
  // A document page's "Draft this with Shisho" preselects its type, as on the
  // website; an unknown or non-drafted slug resolves to nothing.
  const target = doc ? getDocument(doc) : undefined;
  const docType = target?.draftsAs;
  return (
    <ShishoTabBody
      key={`${mode ?? "default"}-${doc ?? ""}`}
      requested={mode}
      docType={docType}
      docName={docType ? target?.name : undefined}
    />
  );
}

function ShishoTabBody({ requested, docType, docName }: { requested?: string; docType?: DocType; docName?: string }) {
  const p = usePalette();
  const [mode, setMode] = useState<"draft" | "review">(requested === "review" ? "review" : "draft");
  // Taken once, on mount: a format and facts handed over by the Formats screen.
  const [seeded] = useState(() => {
    if (requested !== "format") return "";
    const seed = takeDraftSeed();
    return seed ? seedMessage(seed) : "";
  });

  if (!apiConfigured) {
    return (
      <Screen>
        <FadedPhoto source={require("../../../assets/screens/shisho.jpg")} height={180} />
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
      <FadedPhoto source={require("../../../assets/screens/shisho.jpg")} height={180} />
      <T v="label" tone="indigo">Shisho</T>
      <Headline text="Describe the facts, then have the draft *marked*." />
      <StageTrail product="draft-bot" />
      {docName ? <T v="label" tone="soft">Set up to draft: {docName}</T> : null}
      <T tone="soft">{SHISHO_INTRO}</T>
      <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
        <Chip label="Draft with Shisho" selected={mode === "draft"} onPress={() => setMode("draft")} />
        <Chip label="Review a draft" selected={mode === "review"} onPress={() => setMode("review")} />
      </View>
      {mode === "draft" ? (
        <ShishoChat initialInput={seeded || (requested === "hearing" ? HEARING_PROMPT : "")} docType={docType} />
      ) : (
        <ShishoReview initialDocType={docType} />
      )}

      {/* The rest of the website's Shisho page. */}
      <SectionRule />
      <T v="label" tone="indigo">What it drafts</T>
      {DRAFT_TYPES.map((item) => (
        <T key={item} v="h3" style={{ fontSize: 17, borderBottomWidth: 1, borderBottomColor: p.line, borderStyle: "dotted", paddingBottom: space.sm }}>{item}</T>
      ))}
      <SectionRule />
      <T v="label" tone="indigo">For advocates</T>
      <Headline text="Draft with precision. Argue with *authority*." v="h2" />
      <StatusList items={EXTRAS.advocates} />
      <SampleCard label={GROUNDS_SAMPLE.label} rows={GROUNDS_SAMPLE.rows} />
    </Screen>
  );
}
