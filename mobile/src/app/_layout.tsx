import { useEffect } from "react";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { EBGaramond_600SemiBold, EBGaramond_600SemiBold_Italic } from "@expo-google-fonts/eb-garamond";
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
} from "@expo-google-fonts/instrument-sans";
import { IBMPlexMono_400Regular } from "@expo-google-fonts/ibm-plex-mono";
import { fonts, usePalette } from "@/ui/theme";
import { Button, Notice, Screen } from "@/ui/components";
import { welcomeStore } from "@/state/stores";
import { useSession } from "@/state/auth";
// Loads reminders early; notifications themselves load lazily (see that file).
import "@/state/reminders";

void SplashScreen.preventAutoHideAsync();

/**
 * Shown when a screen throws while rendering. The offline tools keep their
 * data on the phone, so a retry or going Home loses nothing the user saved.
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <Screen>
      <Notice
        title="That screen did not load"
        body="Something went wrong on our side. Anything you saved on this phone is safe. Try again, or go back."
      >
        <Button label="Try again" variant="dark" onPress={retry} />
      </Notice>
    </Screen>
  );
}

export default function RootLayout() {
  const p = usePalette();
  const [loaded, fontError] = useFonts({
    EBGaramond_600SemiBold,
    EBGaramond_600SemiBold_Italic,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    IBMPlexMono_400Regular,
  });
  const { ready: welcomeReady } = welcomeStore.use();
  const { ready: sessionReady } = useSession();
  const ready = welcomeReady && sessionReady;

  // If a font fails to load the app still opens, in the system font: the
  // legal tools matter more than the typeface.
  const fontsDone = loaded || fontError != null;

  useEffect(() => {
    if (fontsDone && ready) void SplashScreen.hideAsync();
  }, [fontsDone, ready]);

  if (!fontsDone || !ready) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: p.paper },
          headerTintColor: p.ink,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 20 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: p.paper },
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ presentation: "modal", title: "Welcome" }} />
        <Stack.Screen name="limitation" options={{ title: "Limitation checker" }} />
        <Stack.Screen name="ipc-bns" options={{ title: "IPC to BNS" }} />
        <Stack.Screen name="documents/index" options={{ title: "Documents" }} />
        <Stack.Screen name="documents/[slug]" options={{ title: "Document" }} />
        <Stack.Screen name="map" options={{ title: "The Map" }} />
        <Stack.Screen name="clerks" options={{ title: "Advocate Clerks" }} />
        <Stack.Screen name="moot" options={{ title: "Moot kit" }} />
        <Stack.Screen name="case-brief" options={{ title: "Case-brief practice" }} />
        <Stack.Screen name="revision" options={{ title: "Revision" }} />
        <Stack.Screen name="works-today" options={{ title: "What works today" }} />
        <Stack.Screen name="account" options={{ title: "Account" }} />
        <Stack.Screen name="next-dates" options={{ title: "Next-date reminders" }} />
        <Stack.Screen name="courses/index" options={{ title: "Courses" }} />
        <Stack.Screen name="courses/[id]" options={{ title: "Course" }} />
        <Stack.Screen name="classes/[track]" options={{ title: "Classes" }} />
        <Stack.Screen name="library/index" options={{ title: "Legal Library" }} />
        <Stack.Screen name="library/[slug]" options={{ title: "Judgment" }} />
        <Stack.Screen name="library/lookup" options={{ title: "Look up a judgment" }} />
        <Stack.Screen name="info/[slug]" options={{ title: "" }} />
        <Stack.Screen name="for/index" options={{ title: "Who it's for" }} />
        <Stack.Screen name="for/[slug]" options={{ title: "" }} />
      </Stack>
    </>
  );
}
