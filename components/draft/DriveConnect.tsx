"use client";

import { useEffect, useState } from "react";
import { loadGooglePickerApi } from "@/lib/googlePicker";
import { DRIVE_TEMPLATE_MIME_TYPES, type DriveTemplateFile } from "@/lib/driveTemplate";

/**
 * Minimal typing for the slice of Google's (untyped) Picker JS API this
 * component actually calls — not a full definition of the library, just
 * enough to avoid `any` for the calls made here.
 */
type PickerResponse = { action: string; docs?: { id: string; name: string; mimeType: string }[] };

interface GooglePickerNamespace {
  Action: { PICKED: string };
  ViewId: { DOCS: string };
  DocsView: new (viewId: string) => {
    setMimeTypes: (mimeTypes: string) => void;
  };
  PickerBuilder: new () => {
    addView: (view: unknown) => void;
    setOAuthToken: (token: string) => void;
    setDeveloperKey: (key: string) => void;
    setCallback: (cb: (data: PickerResponse) => void) => void;
    build: () => { setVisible: (visible: boolean) => void };
  };
}

declare global {
  interface Window {
    google?: { picker: GooglePickerNamespace };
  }
}

const CONNECT_ERROR_MESSAGES: Record<string, string> = {
  denied: "Google Drive connection cancelled.",
};
const DEFAULT_CONNECT_ERROR = "Couldn't connect to Google Drive. Try again.";

/**
 * "Connect Google Drive" / connected-state UI for the drafting chat's
 * templates feature. This is deliberately a single-file picker, not a
 * folder browser: a visitor's own Drive holds their whole practice — case
 * files, correspondence, drafts on everything — and the point of `drive.file`
 * scope is that this app only ever gets access to the ONE document they
 * explicitly point at as their default template, nothing else in there.
 *
 * Owns only its own connect/picker-opening status — the actual connected/
 * template/files state lives in DraftWorkspace (lifted so
 * components/draft/DraftingAgent.tsx can auto-apply the default template
 * too) and flows back down here as props; this component just reports
 * changes up via `onTemplateChange`.
 */
export function DriveConnect({
  connected,
  templateName,
  autoOpenPicker = false,
  connectError = null,
  onTemplateChange,
}: {
  connected: boolean;
  templateName: string | null;
  /** True right after landing back from Google's consent screen — opens
   *  the template picker immediately so a freshly-connected visitor isn't
   *  left with nothing to do next. */
  autoOpenPicker?: boolean;
  /** The raw `?driveError=` value from app/draft-bot/page.tsx, if any. */
  connectError?: string | null;
  onTemplateChange: (files: DriveTemplateFile[], templateName: string) => void;
}) {
  const [status, setStatus] = useState<"idle" | "opening">("idle");
  const [error, setError] = useState<string | null>(
    connectError ? (CONNECT_ERROR_MESSAGES[connectError] ?? DEFAULT_CONNECT_ERROR) : null,
  );

  async function openPicker() {
    const pickerApiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;
    if (!pickerApiKey) {
      setError("Google Drive isn't fully set up yet — ask the site owner to finish configuration.");
      return;
    }

    setStatus("opening");
    setError(null);

    try {
      const [, tokenRes] = await Promise.all([loadGooglePickerApi(), fetch("/api/drive/token")]);

      if (!tokenRes.ok) {
        const data = await tokenRes.json().catch(() => null);
        throw new Error(data?.error ?? "Could not reach Google Drive.");
      }
      const { accessToken } = (await tokenRes.json()) as { accessToken: string };

      const picker = window.google?.picker;
      if (!picker) throw new Error("Google Drive's file picker failed to load.");

      const view = new picker.DocsView(picker.ViewId.DOCS);
      view.setMimeTypes(DRIVE_TEMPLATE_MIME_TYPES.join(","));

      const builder = new picker.PickerBuilder();
      builder.addView(view);
      builder.setOAuthToken(accessToken);
      builder.setDeveloperKey(pickerApiKey);
      builder.setCallback((data) => {
        if (data.action !== picker.Action.PICKED || !data.docs?.[0]) return;
        void handleTemplatePicked(data.docs[0]);
      });

      builder.build().setVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open Google Drive's file picker.");
    } finally {
      setStatus("idle");
    }
  }

  async function handleTemplatePicked(doc: { id: string; name: string; mimeType: string }) {
    setStatus("opening");
    setError(null);
    try {
      const res = await fetch("/api/drive/template", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileId: doc.id, fileName: doc.name, mimeType: doc.mimeType }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? "Could not save that template.");
      onTemplateChange(result.files, result.templateName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that template.");
    } finally {
      setStatus("idle");
    }
  }

  useEffect(() => {
    // Deliberately a one-time action triggered by *how the visitor arrived*
    // (fresh back from Google's consent screen), not a value being
    // synchronized from props/state — the case react-hooks/set-state-in-effect
    // exists to catch is different from this one, so it's disabled here
    // rather than restructured around.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoOpenPicker) void openPicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* A setting, not a step: one quiet line under the composer, with the
     action at the right edge, instead of a card that sat above the chat and
     outweighed it. */
  const action =
    "inline-flex h-8 shrink-0 items-center rounded-seal border border-ink/30 px-3 text-[12.5px] text-ink-soft transition-colors duration-[var(--duration-nudge)] ease-[var(--ease-precise)] hover:border-ink/70 hover:text-ink disabled:pointer-events-none disabled:opacity-50";

  return (
    <div className="border-t border-ink/10 pt-4">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1 basis-[22rem]">
          <p className="label-mono text-ink-faint">Default template</p>
          {connected ? (
            <p className="mt-1.5 truncate text-[13.5px] text-ink">
              {templateName ?? "Connected — no template chosen yet."}
            </p>
          ) : null}
          <p className="mt-1.5 max-w-[68ch] text-[12.5px] leading-relaxed text-ink-soft">
            {!connected
              ? "Connect Google Drive and point at the one document you want every draft to follow — Shisho only ever sees that one file, nothing else in your Drive."
              : templateName
                ? "Every draft in this chat will automatically follow this document’s structure and formatting, unless you remove it for a specific conversation."
                : null}
          </p>
        </div>
        {connected ? (
          <button type="button" onClick={openPicker} disabled={status === "opening"} aria-disabled={status === "opening"} className={action}>
            {status === "opening" ? "Opening…" : templateName ? "Change template" : "Choose template"}
          </button>
        ) : (
          <a href="/api/drive/connect" className={action}>
            Connect Google Drive
          </a>
        )}
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-[13px] text-seal">
          {error}
        </p>
      ) : null}
    </div>
  );
}
