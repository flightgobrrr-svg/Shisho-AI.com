import { useState } from "react";
import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Field, Headline, Notice, Row, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { getAudience } from "@/lib/audiences";
import { TODAY, startHereHeading } from "@/lib/audiencePages";
import { apiConfigured, describeError } from "@/api/client";
import { registerInterest } from "@/api/endpoints";
import { appRoute } from "@/features/audienceRoutes";

/**
 * One audience: the same pitch, sample and "start here" list as the
 * website's /for/[slug] page, from the same data. Each page says whether it
 * is available now or planned, and the sample is labelled as one.
 */
export default function AudiencePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const p = usePalette();
  const audience = slug ? getAudience(slug) : undefined;

  if (!audience) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Who it's for" }} />
        <Notice title="That page is not here" body="Go back and pick a group from the list." />
      </Screen>
    );
  }

  const today = (TODAY[audience.slug] ?? []).slice(0, 3);

  return (
    <Screen>
      <Stack.Screen options={{ title: audience.name }} />
      <T v="label" tone={audience.live ? "indigo" : "faint"}>{audience.live ? "Available now" : "Planned"}</T>
      <Headline text={audience.headline} v="h2" />
      <T tone="soft">{audience.blurb}</T>
      {audience.aside ? (
        <View style={{ borderLeftWidth: 1, borderLeftColor: p.lineStrong, paddingLeft: space.md, gap: space.xs }}>
          <T v="small" tone="soft">{audience.aside}</T>
          {audience.sources ? <T v="small" tone="faint">Sources: {audience.sources}</T> : null}
        </View>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {audience.chips.map((chip) => (
          <Chip key={chip} label={chip} />
        ))}
      </View>

      {audience.sample ? (
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
            <T v="label" tone="indigo" style={{ flexShrink: 1 }}>{audience.sample.label}</T>
            <T v="label" tone="faint">Sample</T>
          </View>
          {audience.sample.rows.map((row) => (
            <View
              key={row.term}
              style={{
                flexDirection: "row",
                gap: space.md,
                paddingVertical: space.sm,
                borderTopWidth: 1,
                borderTopColor: p.line,
              }}
            >
              <T v="h3" style={{ fontSize: 16, width: "38%" }}>{row.term}</T>
              {row.detail ? (
                <T v="small" tone="soft" style={{ flex: 1 }}>{row.detail}</T>
              ) : null}
            </View>
          ))}
          {audience.disclaimer ? (
            <T v="small" tone="soft" style={{ fontStyle: "italic" }}>{audience.disclaimer}</T>
          ) : null}
        </Card>
      ) : null}

      {today.length > 0 ? (
        <View>
          <T v="label" tone="indigo">Start here</T>
          <T v="h3" style={{ marginTop: space.sm, marginBottom: space.xs }}>{startHereHeading(today.length)}</T>
          {today.map((item) => {
            const route = item.status === "live" ? appRoute(item.href) : null;
            return (
              <Row
                key={item.label}
                title={item.label}
                detail={route || item.status !== "live" ? item.note : `${item.note} On the website.`}
                status={item.status}
                href={route ?? undefined}
              />
            );
          })}
        </View>
      ) : null}

      {audience.live ? null : <InterestSignup slug={audience.slug} name={audience.name} />}
    </Screen>
  );
}

function InterestSignup({ slug, name }: { slug: string; name: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!apiConfigured) return null;

  if (state === "done") {
    return <Notice title="You're on the list" body={`One email, once, when the ${name} tools are ready.`} />;
  }

  const send = async () => {
    setError(null);
    setState("sending");
    try {
      await registerInterest(email.trim(), slug);
      setState("done");
    } catch (e) {
      setError(describeError(e));
      setState("idle");
    }
  };

  return (
    <Card>
      <T v="h3">Tell me when this opens</T>
      <T v="small" tone="soft">
        One email, once, when the {name} tools are ready. We keep your address and this choice only.
      </T>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="you@example.com"
      />
      {error ? <T v="small" tone="seal">{error}</T> : null}
      <Button
        label={state === "sending" ? "Sending…" : "Notify me"}
        variant="dark"
        onPress={send}
        disabled={state === "sending" || !email.includes("@")}
      />
    </Card>
  );
}
