import { useEffect } from "react";
import { Text } from "react-native";
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
import { MenuButton } from "@/ui/Brand";
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
          headerRight: () => <MenuButton />,
          // Titles grow with the phone's text size only a little, so a long one
          // ("Judicial services prelims") still fits beside the back arrow.
          headerTitle: ({ children }) => (
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.1}
              accessibilityRole="header"
              style={{ fontFamily: fonts.display, fontSize: 20, color: p.ink }}
            >
              {children}
            </Text>
          ),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ presentation: "modal", title: "Welcome", headerRight: () => null }} />
        <Stack.Screen name="limitation/index" options={{ title: "Limitation checker" }} />
        <Stack.Screen name="limitation/[id]" options={{ title: "Limitation" }} />
        <Stack.Screen name="ipc-bns/index" options={{ title: "IPC to BNS" }} />
        <Stack.Screen name="ipc-bns/[ipc]" options={{ title: "IPC to BNS" }} />
        <Stack.Screen name="formats" options={{ title: "Formats" }} />
        <Stack.Screen name="library/acts" options={{ title: "Bare Acts index" }} />
        <Stack.Screen name="library/provisions" options={{ title: "Bare Acts" }} />
        <Stack.Screen name="internship" options={{ title: "The internship" }} />
        <Stack.Screen name="contact" options={{ title: "Contact" }} />
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
        <Stack.Screen name="courses/[id]" options={{ title: "Course" }} />
        <Stack.Screen name="classes/[track]" options={{ title: "Classes" }} />
        <Stack.Screen name="pricing" options={{ title: "Pricing" }} />
        <Stack.Screen name="library/[slug]" options={{ title: "Judgment" }} />
        <Stack.Screen name="library/lookup" options={{ title: "Look up a judgment" }} />
        <Stack.Screen name="info/[slug]" options={{ title: "" }} />
        <Stack.Screen name="for/index" options={{ title: "Who it's for" }} />
        <Stack.Screen name="for/[slug]" options={{ title: "" }} />
        <Stack.Screen name="tools/contract-review" options={{ title: "Contract review" }} />
        <Stack.Screen name="tools/case-record" options={{ title: "Case record" }} />
        <Stack.Screen name="tools/lesson-plan" options={{ title: "Lesson plan" }} />
        <Stack.Screen name="tools/plain-answer" options={{ title: "Plain-language answer" }} />
        <Stack.Screen name="tools/doctrine" options={{ title: "Trace a doctrine" }} />
        <Stack.Screen name="tools/saved" options={{ title: "Saved results" }} />
        <Stack.Screen name="tests/index" options={{ title: "Mock tests" }} />
        <Stack.Screen name="tests/[exam]" options={{ title: "Mock test" }} />
        <Stack.Screen name="exam-revision" options={{ title: "Exam revision" }} />
        <Stack.Screen name="payment" options={{ title: "Payment" }} />
        <Stack.Screen name="licences" options={{ title: "Open-source notices" }} />
        <Stack.Screen name="clerk-work/index" options={{ title: "Clerk Work" }} />
        <Stack.Screen name="clerk-work/generate" options={{ title: "Quick Generate" }} />
        <Stack.Screen name="clerk-work/case/[id]" options={{ title: "Case" }} />
        <Stack.Screen name="clerk-work/document/[id]" options={{ title: "Document" }} />
        <Stack.Screen name="clerk-work/members" options={{ title: "Office members" }} />
        <Stack.Screen name="clerk-work/services" options={{ title: "Clerk services" }} />
        <Stack.Screen name="clerk-work/cases" options={{ title: "Case register" }} />
        <Stack.Screen name="clerk-work/tasks" options={{ title: "Tasks" }} />
        <Stack.Screen name="clerk-work/task/[id]" options={{ title: "Task" }} />
        <Stack.Screen name="clerk-work/register/[kind]" options={{ title: "Register" }} />
        <Stack.Screen name="clerk-work/daily" options={{ title: "Daily court work" }} />
        <Stack.Screen name="clerk-work/templates" options={{ title: "Templates" }} />
        <Stack.Screen name="clerk-work/admin" options={{ title: "Administration" }} />
        <Stack.Screen
          name="menu"
          options={{ presentation: "transparentModal", animation: "none", headerShown: false, contentStyle: { backgroundColor: "transparent" } }}
        />
      </Stack>
    </>
  );
}
