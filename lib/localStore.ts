/**
 * A tiny localStorage-backed store for useSyncExternalStore.
 *
 * Why not read storage in an effect: it needs a setState on mount, which
 * React flags, and it flashes empty state. useSyncExternalStore gives the
 * server a distinct snapshot (`undefined`, meaning "not read yet") so a page
 * can show a loading state and then the real data without a hydration
 * mismatch. Storage can be blocked (private windows, strict settings), so
 * writes fall back to an in-memory copy and the page still works for the
 * visit; the data just does not persist.
 */
export function createLocalStore(key: string) {
  const event = `shisho-local:${key}`;
  let memory: string | null = null;
  let usingMemory = false;

  return {
    subscribe(callback: () => void) {
      window.addEventListener("storage", callback);
      window.addEventListener(event, callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(event, callback);
      };
    },
    getSnapshot(): string | null {
      if (usingMemory) return memory;
      try {
        return localStorage.getItem(key);
      } catch {
        usingMemory = true;
        return memory;
      }
    },
    /** `undefined` on the server: "not read yet". */
    getServerSnapshot(): string | null | undefined {
      return undefined;
    },
    set(value: string) {
      try {
        if (!usingMemory) localStorage.setItem(key, value);
        else memory = value;
      } catch {
        usingMemory = true;
      }
      memory = value;
      window.dispatchEvent(new Event(event));
    },
  };
}
