import { useState } from "react";
import { View } from "react-native";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Button, Card, Chip, Field, Headline, Notice, Row, Screen, T } from "@/ui/components";
import { space, usePalette } from "@/ui/theme";
import { AUDIENCES, getAudience } from "@/lib/audiences";
import { TODAY, startHereHeading } from "@/lib/audiencePages";
import { apiConfigured, describeError } from "@/api/client";
import { registerInterest } from "@/api/endpoints";
import { appRoute } from "@/features/audienceRoutes";
import { AUDIENCE_PHOTOS, AudienceSample } from "@/features/audienceUi";
import { FadedPhoto } from "@/ui/FadedPhoto";
import { APP_FEATURES, BUILT_IN_APP, builtInApp } from "@/features/appFeatures";
import { correctItems } from "@/features/sharedCopy";

/**
 * One audience: the same pitch, sample and "start here" list as the
 * website's /for/[slug] page, from the same data. Each page says whether it
 * is available now or planned, and the sample is labelled as one. Where the
 * app has built what the website still plans (features/appFeatures.ts), the
 * page opens with it and says "In the app".
 */
export default function AudiencePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const p = usePalette();
  const audience = slug ? getAudience(slug) : undefined;

  // Clerks and students have their own screens (the Advocate Clerks' manual,
  // Courses); a link to their /for/ address opens that screen instead.
  const served = !audience && slug ? AUDIENCES.find((a) => a.slug === slug && a.href) : undefined;
  const servedRoute = served ? appRoute(served.href) : null;
  if (servedRoute) return <Redirect href={servedRoute} />;

  if (!audience) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Who it's for" }} />
        <Notice title="That page is not here" body="Go back and pick a group from the list." />
      </Screen>
    );
  }

  const today = correctItems((TODAY[audience.slug] ?? []).slice(0, 3));
  const inApp = APP_FEATURES[audience.slug] ?? [];
  const available = audience.live || builtInApp(audience.slug);

  return (
    <Screen>
      <Stack.Screen options={{ title: audience.name }} />
      {audience.photo && AUDIENCE_PHOTOS[audience.slug] ? (
        <FadedPhoto source={AUDIENCE_PHOTOS[audience.slug]} height={260} />
      ) : null}
      <T v="label" tone={available ? "indigo" : "faint"}>{audience.live ? "Available now" : available ? "Available in the app" : "Planned"}</T>
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

      <AudienceSample audience={audience} />

      {inApp.length > 0 ? (
        <View>
          <T v="label" tone="indigo">In the app</T>
          <T v="h3" style={{ marginTop: space.sm, marginBottom: space.xs }}>Built for you.</T>
          {inApp.map((f) => (
            <Row key={f.label} title={f.label} detail={f.note} status={f.offline ? "offline" : "live"} href={f.href} />
          ))}
        </View>
      ) : null}

      {today.length > 0 ? (
        <View>
          <T v="label" tone="indigo">Start here</T>
          <T v="h3" style={{ marginTop: space.sm, marginBottom: space.xs }}>{startHereHeading(today.length)}</T>
          {today.map((item) => {
            const built = item.status === "planned" ? BUILT_IN_APP[item.label] : undefined;
            const status = built ? "live" : item.status;
            const route = built ?? (item.status === "live" ? appRoute(item.href) : null);
            return (
              <Row
                key={item.label}
                title={item.label}
                detail={route || status !== "live" ? item.note : `${item.note} On the website.`}
                status={status}
                href={route ?? undefined}
              />
            );
          })}
        </View>
      ) : null}

      {available ? null : <InterestSignup slug={audience.slug} name={audience.name} />}
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
