import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useEffect, useSyncExternalStore } from "react";

/**
 * The signed-in session and the per-install device ID.
 *
 * Tokens are the only secrets the app ever holds, and they are the user's own.
 * On a phone they live in the OS secure store (Keychain / Keystore). The web
 * preview has no secure store, so it falls back to local storage; that is for
 * development only. The app never holds any server key.
 */

export type Session = {
  accessToken: string;
  refreshToken: string;
  /** Epoch seconds. */
  expiresAt: number;
  user: { id: string; email: string };
};

const SESSION_KEY = "shisho-session";
const DEVICE_KEY = "shisho-device-id";

const secure = Platform.OS !== "web";

async function readSecret(key: string): Promise<string | null> {
  try {
    return secure ? await SecureStore.getItemAsync(key) : await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function writeSecret(key: string, value: string | null) {
  try {
    if (value === null) {
      if (secure) await SecureStore.deleteItemAsync(key);
      else await AsyncStorage.removeItem(key);
    } else if (secure) await SecureStore.setItemAsync(key, value);
    else await AsyncStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the session lasts for this launch only */
  }
}

let session: Session | null = null;
let ready = false;
let loading: Promise<void> | null = null;
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach((fn) => fn());
const subscribe = (fn: () => void) => {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
};

function isSession(v: unknown): v is Session {
  const s = v as Session | null;
  return Boolean(
    s &&
      typeof s.accessToken === "string" &&
      typeof s.refreshToken === "string" &&
      typeof s.expiresAt === "number" &&
      s.user &&
      typeof s.user.id === "string" &&
      typeof s.user.email === "string",
  );
}

export function loadSession(): Promise<void> {
  loading ??= readSecret(SESSION_KEY)
    .then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (isSession(parsed)) session = parsed;
      } catch {
        /* a corrupt value means signed out */
      }
    })
    .finally(() => {
      ready = true;
      notify();
    });
  return loading;
}

export const getSession = () => session;

export function saveSession(next: Session) {
  session = next;
  notify();
  void writeSecret(SESSION_KEY, JSON.stringify(next));
}

export function clearSession() {
  session = null;
  notify();
  void writeSecret(SESSION_KEY, null);
}

/** Hook: the current session and whether storage has been read yet. */
export function useSession() {
  useEffect(() => {
    void loadSession();
  }, []);
  const s = useSyncExternalStore(subscribe, () => session, () => session);
  const r = useSyncExternalStore(subscribe, () => ready, () => ready);
  return { session: s, ready: r };
}

/** A random ID for this install. It keys the free-tier counter; it identifies no one. */
let deviceId: string | null = null;
export async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  const stored = await AsyncStorage.getItem(DEVICE_KEY).catch(() => null);
  if (stored) {
    deviceId = stored;
    return stored;
  }
  const fresh = Crypto.randomUUID();
  deviceId = fresh;
  await AsyncStorage.setItem(DEVICE_KEY, fresh).catch(() => {});
  return fresh;
}
