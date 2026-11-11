"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const noSubscription = () => () => {};
const getSupportedSnapshot = () =>
  Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
const getServerSnapshot = () => false;

/**
 * Wraps the browser's own Web Speech API (`SpeechRecognition` /
 * `webkitSpeechRecognition`) — no server, no API key, no cost. Chrome, Edge,
 * and Safari (webkit-prefixed) support it; Firefox does not enable it by
 * default, so `supported` is false there and the caller should simply not
 * render a mic button rather than show one that fails.
 *
 * `continuous: true` + `interimResults: true`: keeps listening across
 * pauses (dictating facts is naturally halting) and surfaces a live partial
 * transcript via `interimTranscript`, separate from the committed
 * `finalTranscript` chunks the caller appends to its own input state —
 * kept as two values rather than one so the caller decides how to combine
 * them (DraftingAgent appends each final chunk to the textarea and shows
 * the interim text as a preview, never committing it until it's final).
 */
export function useSpeechToText() {
  // No SSR/hydration mismatch: the server snapshot is always `false` (no
  // `window`), matching the client's own first-paint value before it can
  // re-check — useSyncExternalStore is the correct tool for reading an
  // external, browser-only capability like this, not a setState-in-effect.
  const supported = useSyncExternalStore(noSubscription, getSupportedSnapshot, getServerSnapshot);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const onFinalRef = useRef<((text: string) => void) | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const start = useCallback((onFinal: (text: string) => void) => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    onFinalRef.current = onFinal;
    setError(null);
    setInterimTranscript("");

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          onFinalRef.current?.(text);
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" fire on ordinary silence/stop — not real
      // errors worth surfacing to someone mid-dictation.
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(
          event.error === "not-allowed"
            ? "Microphone access was denied. Allow it in your browser's site settings to dictate."
            : "Dictation stopped unexpectedly. Try again.",
        );
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => stop, [stop]);

  return { supported, listening, interimTranscript, error, start, stop };
}
