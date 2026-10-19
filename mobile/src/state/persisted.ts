import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";

/**
 * A small JSON store backed by AsyncStorage, readable from any screen.
 *
 * Everything the app remembers (saved case briefs, the moot checklist, the
 * welcome screen flag) lives on this device only. `ready` is false until the
 * first read finishes, so a screen can show a loading state instead of
 * flashing empty. If storage is unavailable, reads fall back to the initial
 * value and writes simply do not persist; the app keeps working for the
 * session.
 */
export function createPersistedStore<T>(key: string, initial: T) {
  let value = initial;
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

  const load = () => {
    loading ??= AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw != null) {
          try {
            value = JSON.parse(raw) as T;
          } catch {
            /* corrupt value: keep the initial one */
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        ready = true;
        notify();
      });
    return loading;
  };

  return {
    get: () => value,
    set(next: T) {
      value = next;
      notify();
      AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
    },
    /** Hook: the current value and whether the first read has finished. */
    use() {
      useEffect(() => {
        void load();
      }, []);
      const v = useSyncExternalStore(subscribe, () => value, () => value);
      const r = useSyncExternalStore(subscribe, () => ready, () => ready);
      return { value: v, ready: r };
    },
    load,
  };
}
