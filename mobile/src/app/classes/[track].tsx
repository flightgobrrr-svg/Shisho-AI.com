import { Linking } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Card, Button, Notice, Screen, T } from "@/ui/components";
import { PageHeader } from "@/ui/web";
import {
  LEGAL_ENGLISH_LESSONS,
  LEGAL_ENGLISH_LIVE_SESSIONS,
  SPOKEN_ENGLISH_LESSONS,
  SPOKEN_ENGLISH_LIVE_SESSIONS,
  formatSessionTime,
  type Lesson,
} from "@/lib/recordings";

/** A recording opens in the phone's video app or browser; the app does not host video. */
const watchUrl = (l: Lesson) =>
  l.provider === "youtube" ? `https://www.youtube.com/watch?v=${l.videoId}` : `https://vimeo.com/${l.videoId}`;

export default function Classes() {
  const { track } = useLocalSearchParams<{ track: string }>();
  const legal = track === "legal";
  const lessons = legal ? LEGAL_ENGLISH_LESSONS : SPOKEN_ENGLISH_LESSONS;
  const live = (legal ? LEGAL_ENGLISH_LIVE_SESSIONS : SPOKEN_ENGLISH_LIVE_SESSIONS).filter(
    (s) => new Date(s.startsAt).getTime() > Date.now() - 2 * 60 * 60 * 1000,
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: legal ? "Legal English" : "Spoken English" }} />
      <PageHeader
        eyebrow={legal ? "Legal English" : "Spoken English"}
        headline={legal ? "The *written* register courts expect." : "The *spoken* register courts expect."}
        intro={
          legal
            ? "Reading a judgment and writing a pleading, in the English an Indian courtroom expects on paper — recorded classes to watch in any order, and live sessions on the calendar below. Nothing here is timed or graded."
            : "Oral argument and courtroom submissions, in the English an Indian courtroom expects out loud — recorded classes to watch in any order, and live sessions on the calendar below. Nothing here is timed or graded."
        }
      />

      <T v="label" tone="indigo">Recorded classes</T>
      {lessons.length === 0 ? (
        <Notice title="No recorded classes yet" body="Classes appear here as soon as they are published. Nothing is listed until a real recording exists." />
      ) : (
        lessons.map((l) => (
          <Card key={l.id}>
            <T v="h3">{l.title}</T>
            <T v="small" tone="soft">{l.description}</T>
            <T v="small" tone="faint">{l.duration}</T>
            <Button label="Watch" variant="ghost" onPress={() => void Linking.openURL(watchUrl(l))} />
          </Card>
        ))
      )}

      <T v="label" tone="indigo">Live classes</T>
      {live.length === 0 ? (
        <Notice title="No live classes scheduled" body="A live class is listed here once it has a real date." />
      ) : (
        live.map((s) => (
          <Card key={s.id}>
            <T v="h3">{s.title}</T>
            <T v="small" tone="faint">{formatSessionTime(s.startsAt)}</T>
            {s.joinUrl ? <Button label="Join" variant="dark" onPress={() => void Linking.openURL(s.joinUrl!)} /> : <T v="small" tone="soft">The joining link will be added before the class.</T>}
          </Card>
        ))
      )}
    </Screen>
  );
}
