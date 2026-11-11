import { View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ChoiceCard, Headline, Screen, T, TextButton } from "@/ui/components";
import { welcomeStore } from "@/state/stores";

import { FadedPhoto } from "@/ui/FadedPhoto";
const STARTS: { label: string; detail: string; href: Href }[] = [
  { label: "I am a law student", detail: "Case-brief practice, revision, moot kit", href: "/courses" },
  { label: "I am an advocate", detail: "Limitation checker, IPC to BNS, documents", href: "/limitation" },
  { label: "I work in a clerk's office", detail: "Clerk Work: cases, daily sheets and 63 services", href: "/clerk-work" },
  { label: "I am just curious", detail: "See how a case moves, stage by stage", href: "/map" },
];

/**
 * Shown once, and never required: Skip is always at the top and every choice
 * just opens a useful tool. Nothing is asked of the visitor and nothing is
 * stored beyond "this was seen".
 */
export default function Welcome() {
  const router = useRouter();

  const go = (href: Href) => {
    welcomeStore.set({ seen: true });
    router.dismissAll();
    router.replace("/");
    if (href !== "/") router.push(href);
  };

  return (
    <Screen>
      <FadedPhoto source={require("../../assets/screens/welcome.jpg")} height={180} />
      <View style={{ alignItems: "flex-end" }}>
        <TextButton label="Skip" onPress={() => go("/")} />
      </View>
      <T v="label" tone="indigo">Welcome</T>
      <Headline text="Where would you like to *start*?" />
      <T tone="soft">Verified tools for Indian law. They work without a signal, and what you save stays on this phone.</T>
      <View style={{ gap: 12, marginTop: 8 }}>
        {STARTS.map((s) => (
          <ChoiceCard key={s.label} title={s.label} detail={s.detail} onPress={() => go(s.href)} />
        ))}
      </View>
    </Screen>
  );
}
