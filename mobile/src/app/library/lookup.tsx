import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Button, Field, Notice, Screen, T } from "@/ui/components";
import { DigestBody } from "@/features/DigestBody";
import { apiConfigured, describeError } from "@/api/client";
import { ApiError } from "@/api/client";
import { lookupJudgment, type DigestResult } from "@/api/endpoints";
import { useSession } from "@/state/auth";

/**
 * Looks up any judgment by name. Signed-in only, because each new judgment can
 * cost a model call on the server; the screen says so rather than failing.
 */
export default function Lookup() {
  const { session } = useSession();
  // A case name typed on Home arrives as ?q= and is filled in, ready to send.
  const { q: passed } = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(passed ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DigestResult | null>(null);

  if (!apiConfigured) {
    return (
      <Screen>
        <Notice title="Needs the online service" body="This build is not connected to it." />
      </Screen>
    );
  }
  if (!session) {
    return (
      <Screen>
        <Notice title="Sign in to look up a judgment" body="Looking up a judgment by name is for signed-in people, so the service is not used up by anyone who finds the address.">
          <Button label="Sign in" variant="dark" href="/account" />
        </Notice>
      </Screen>
    );
  }

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await lookupJudgment(q.trim()));
    } catch (e) {
      setError(e instanceof ApiError && e.kind === "http" ? e.message : describeError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <T tone="soft">Type the case as it is titled, “Party A vs Party B”, for the most reliable match.</T>
      <Field label="Case name" value={q} onChangeText={setQ} autoCapitalize="none" returnKeyType="search" onSubmitEditing={run} placeholder="Kesavananda Bharati vs State of Kerala" />
      <Button label={busy ? "Looking it up…" : "Look up"} variant="dark" disabled={busy || q.trim().length < 3} onPress={run} />
      {busy ? <T tone="soft" accessibilityLiveRegion="polite">Finding the judgment and reading its text. This can take a minute.</T> : null}
      {error ? <T tone="seal" accessibilityLiveRegion="polite">{error}</T> : null}
      {result ? (
        <>
          <T v="small" tone="faint">Check that this is the judgment you meant before you rely on it.</T>
          <DigestBody result={result} />
        </>
      ) : null}
    </Screen>
  );
}
