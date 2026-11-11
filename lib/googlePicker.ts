"use client";

/**
 * Loads Google's Picker JS API on demand — only components/draft/
 * DriveConnect.tsx calls this, and only the first time a visitor actually
 * clicks "Connect Google Drive" / "Choose folder". Nothing pulls this
 * external script in for the far more common visitor who never touches the
 * feature at all.
 *
 * Memoized: the script tag and the `gapi.load` call each happen at most
 * once per page load, however many times a visitor opens the picker.
 */

declare global {
  interface Window {
    gapi?: { load: (api: string, options: { callback: () => void; onerror: () => void }) => void };
  }
}

let loadPromise: Promise<void> | null = null;

export function loadGooglePickerApi(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("loadGooglePickerApi can only run in the browser."));
      return;
    }

    const loadPicker = () => {
      window.gapi?.load("picker", {
        callback: resolve,
        onerror: () => reject(new Error("Google Picker failed to load.")),
      });
    };

    if (window.gapi) {
      loadPicker();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.onload = loadPicker;
    script.onerror = () => reject(new Error("Could not load Google's API script."));
    document.head.appendChild(script);
  });

  return loadPromise;
}
