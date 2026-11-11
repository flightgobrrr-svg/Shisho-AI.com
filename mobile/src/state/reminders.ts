import type * as NotificationsModule from "expo-notifications";
import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";
import { isFinished, type RevisionCard } from "@/lib/revisionCore";
import { createPersistedStore } from "@/state/persisted";

/**
 * Reminders as LOCAL notifications: scheduled on the phone, delivered by the
 * phone, never sent through any server. No push service, account or token is
 * involved.
 *
 * expo-notifications is loaded lazily and defensively. In Expo Go (the
 * development app) merely importing it throws, because it pulls in a push
 * module Expo Go does not ship; a static import crashed the whole app on
 * launch. Loaded this way, a phone without it reports reminders as unavailable
 * and every other screen keeps working. In an installed build it loads
 * normally.
 *
 * Permission is asked only when the person switches a reminder on, with the
 * reason on screen, never at launch. On Android 14+ exact-time alarms are
 * restricted, so a reminder can arrive a little late; the screens say
 * "around" rather than promising the minute.
 */

type N = typeof NotificationsModule;
let loaded: N | null | undefined;

/**
 * expo-notifications loads a push-subscription native module as soon as it is
 * imported. Where that module is missing (Expo Go), importing throws, and in
 * development the failure is reported as an uncaught error even if caught. So
 * check for the module first, which does not throw.
 */
const canLoadNotifications = () => requireOptionalNativeModule("ExpoTopicSubscriptionModule") != null;

function notifications(): N | null {
  if (loaded !== undefined) return loaded;
  if (Platform.OS === "web" || !canLoadNotifications()) return (loaded = null);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("expo-notifications") as N;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    loaded = mod;
  } catch {
    loaded = null;
  }
  return loaded;
}

/** Why reminders are unavailable here, or null when they work. */
export function remindersUnavailableReason(): string | null {
  if (Platform.OS === "web") return "Reminders work in the phone app, not in a browser.";
  if (!notifications()) {
    return "Reminders need the installed Shisho app. The development app (Expo Go) cannot schedule them.";
  }
  return null;
}

const CHANNEL = "reminders";

async function ensureChannel(n: N) {
  if (Platform.OS === "android") {
    await n.setNotificationChannelAsync(CHANNEL, {
      name: "Reminders",
      importance: n.AndroidImportance.DEFAULT,
    });
  }
}

export type PermissionResult = "granted" | "denied" | "unavailable";

export async function ensurePermission(): Promise<PermissionResult> {
  const n = notifications();
  if (!n) return "unavailable";
  try {
    await ensureChannel(n);
    const current = await n.getPermissionsAsync();
    if (current.granted) return "granted";
    if (!current.canAskAgain) return "denied";
    const asked = await n.requestPermissionsAsync();
    return asked.granted ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

async function cancel(id: string) {
  const n = notifications();
  if (!n) return;
  try {
    await n.cancelScheduledNotificationAsync(id);
  } catch {
    /* nothing was scheduled under that id */
  }
}

/** Schedule (or replace) one notification by id. Returns false if the time has passed or it failed. */
async function scheduleAt(id: string, when: Date, title: string, body: string): Promise<boolean> {
  const n = notifications();
  if (!n || when.getTime() <= Date.now()) return false;
  await cancel(id);
  try {
    await n.scheduleNotificationAsync({
      identifier: id,
      content: { title, body },
      trigger: { type: n.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
    });
    return true;
  } catch {
    return false;
  }
}

/* ---------- Revision reminders ---------- */

export const reminderPrefs = createPersistedStore<{ revision: boolean }>("shisho-reminder-prefs", { revision: false });

const REVISION_ID = "revision-next";

/**
 * Keeps exactly one revision notification scheduled: for the next brief that
 * will fall due. Called whenever the cards change or the setting is toggled.
 */
export async function syncRevisionReminder(cards: RevisionCard[]) {
  if (!notifications()) return;
  await reminderPrefs.load();
  if (!reminderPrefs.get().revision) {
    await cancel(REVISION_ID);
    return;
  }
  const now = Date.now();
  const next = cards
    .filter((c) => !isFinished(c) && c.dueAt > now)
    .sort((a, b) => a.dueAt - b.dueAt)[0];
  if (!next) {
    await cancel(REVISION_ID);
    return;
  }
  await scheduleAt(REVISION_ID, new Date(next.dueAt), "A case brief is due for revision", next.title);
}

/* ---------- Next-date reminders ---------- */

export type NextDate = {
  id: string;
  title: string;
  /** "YYYY-MM-DD", the hearing date. */
  date: string;
  note: string;
  /** Epoch ms the alert is set for, or null when no alert could be set. */
  alertAt: number | null;
};

export const nextDateStore = createPersistedStore<NextDate[]>("shisho-next-dates", []);

/** 9 am the day before the date, or 9 am on the day if the evening before has passed. */
function alertTimeFor(date: string): Date | null {
  const [y, m, d] = date.split("-").map(Number);
  const before = new Date(y, m - 1, d - 1, 9, 0, 0);
  if (before.getTime() > Date.now()) return before;
  const sameDay = new Date(y, m - 1, d, 9, 0, 0);
  return sameDay.getTime() > Date.now() ? sameDay : null;
}

export async function addNextDate(input: { title: string; date: string; note: string }): Promise<NextDate> {
  const id = `next-${Date.now()}`;
  const when = alertTimeFor(input.date);
  const scheduled = when
    ? await scheduleAt(id, when, `Next date: ${input.title}`, input.note || `Listed on ${input.date}`)
    : false;
  const entry: NextDate = { id, ...input, alertAt: scheduled && when ? when.getTime() : null };
  nextDateStore.set([...nextDateStore.get(), entry].sort((a, b) => a.date.localeCompare(b.date)));
  return entry;
}

export async function removeNextDate(id: string) {
  await cancel(id);
  nextDateStore.set(nextDateStore.get().filter((n) => n.id !== id));
}
