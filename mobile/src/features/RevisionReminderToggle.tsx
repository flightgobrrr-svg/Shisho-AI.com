import { useState } from "react";
import { Linking, View } from "react-native";
import { Card, Chip, T } from "@/ui/components";
import { space } from "@/ui/theme";
import { ensurePermission, reminderPrefs, remindersUnavailableReason, syncRevisionReminder } from "@/state/reminders";
import { revisionStore } from "@/state/stores";

/** Off by default. Turning it on is the only moment the app asks to send notifications. */
export function RevisionReminderToggle() {
  const { value: prefs } = reminderPrefs.use();
  const [message, setMessage] = useState<string | null>(null);

  const unavailable = remindersUnavailableReason();
  if (unavailable) {
    return <T v="small" tone="faint">{unavailable}</T>;
  }

  async function set(on: boolean) {
    setMessage(null);
    if (on) {
      const result = await ensurePermission();
      if (result !== "granted") {
        setMessage("Notifications are turned off for this app. You can allow them in your phone's settings.");
        return;
      }
    }
    reminderPrefs.set({ ...prefs, revision: on });
    await syncRevisionReminder(revisionStore.get());
  }

  return (
    <Card>
      <T v="h3">Remind me when a brief is due</T>
      <T v="small" tone="soft">
        One notification on this phone when the next saved brief comes due. Nothing is sent to Shisho.
      </T>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <Chip label="On" selected={prefs.revision} onPress={() => void set(true)} />
        <Chip label="Off" selected={!prefs.revision} onPress={() => void set(false)} />
      </View>
      {message ? (
        <View style={{ gap: 4 }}>
          <T v="small" tone="seal">{message}</T>
          <T v="small" tone="indigo" accessibilityRole="link" onPress={() => void Linking.openSettings()}>
            Open settings
          </T>
        </View>
      ) : null}
    </Card>
  );
}
