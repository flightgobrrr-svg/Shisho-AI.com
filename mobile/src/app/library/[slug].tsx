import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Button, Notice, Screen, T } from "@/ui/components";
import { DigestBody } from "@/features/DigestBody";
import { PREVIEW_CASES, slugify } from "@/lib/library";
import { apiConfigured, describeError } from "@/api/client";
import { fetchDigest, type DigestResult } from "@/api/endpoints";
import { digestStore, saveDigest } from "@/state/digests";

type State = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ok" };

/**
 * A Library judgment. A digest opened online is shown as it arrived; if it was
 * really prepared from the judgment's text it is also kept on the phone for
 * offline reading. A demo digest (no model was available) is never kept, so the
 * next visit asks again instead of serving a placeholder as if it were saved work.
 */
export default function JudgmentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const item = PREVIEW_CASES.find((c) => slugify(c.title) === slug && c.sourceUrl);
  const { value: saved, ready } = digestStore.use();
  const [state, setState] = useState<State>({ kind: apiConfigured ? "loading" : "error", message: "" });
  const [fresh, setFresh] = useState<DigestResult | null>(null);
  const copy = slug ? saved[slug] : undefined;

  const load = useCallback(async () => {
    if (!slug) return;
    setState({ kind: "loading" });
    try {
      const result = await fetchDigest(slug);
      setFresh(result);
      if (result.digest.mode !== "demo") saveDigest(slug, result);
      setState({ kind: "ok" });
    } catch (e) {
      setState({ kind: "error", message: describeError(e) });
    }
  }, [slug]);

  useEffect(() => {
    if (apiConfigured) void load();
  }, [load]);

  if (!item) {
    return (
      <Screen>
        <Notice title="Judgment not found" body="That judgment is not in the Library." />
      </Screen>
    );
  }

  // What to show: a digest fetched just now, else the copy saved on the phone.
  const shown = fresh ?? copy;
  const offlineCopy = !fresh && copy;

  return (
    <Screen>
      <Stack.Screen options={{ title: "Judgment" }} />
      {shown ? (
        <>
          <DigestBody result={shown} savedAt={offlineCopy ? copy.savedAt : undefined} />
          {state.kind === "loading" ? <T v="small" tone="faint" accessibilityLiveRegion="polite">Checking for a newer copy…</T> : null}
          {state.kind === "error" && apiConfigured ? (
            <T v="small" tone="faint">Could not refresh: {state.message} Showing your saved copy.</T>
          ) : null}
        </>
      ) : !ready ? (
        <T tone="soft">Loading…</T>
      ) : (
        <>
          <T v="title">{item.title}</T>
          <T tone="soft">{item.citation} · {item.court}</T>
          {state.kind === "loading" ? (
            <Notice title="Preparing the digest" body="Reading the judgment's text. This can take up to a minute the first time." />
          ) : (
            <Notice
              title={apiConfigured ? "Could not load the digest" : "Digests need the online service"}
              body={apiConfigured ? (state.kind === "error" ? state.message : "") : "This build is not connected to it. You can still read the judgment itself."}
            >
              {apiConfigured ? <Button label="Try again" variant="dark" onPress={() => void load()} /> : null}
            </Notice>
          )}
          <Button label="Read the judgment on Indian Kanoon" variant="ghost" onPress={() => void Linking.openURL(item.sourceUrl!)} />
        </>
      )}
    </Screen>
  );
}
