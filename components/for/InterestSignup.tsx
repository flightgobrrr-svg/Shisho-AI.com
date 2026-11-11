"use client";

import { useState } from "react";

/**
 * "Tell me when this opens" for a planned audience. It stores only the email
 * and the audience (see the privacy page), and says plainly when sign-up is
 * not open rather than showing a false success.
 */
export function InterestSignup({ audience, name }: { audience: string; name: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, audience, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setState("done");
      } else {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setState("error");
      setMessage("Could not reach the server. Try again.");
    }
  }

  if (state === "done") {
    return (
      <p className="text-[15px] leading-relaxed text-ink" role="status">
        Noted. We will write to you once when the {name} tools open.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="relative max-w-md">
      <label
        htmlFor={`interest-${audience}`}
        className="font-display text-[17px] font-semibold text-ink"
      >
        Tell me when this opens
      </label>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
        One email, once, when the {name} tools are ready. We keep your address and this
        choice only.
      </p>
      <div className="mt-3 flex gap-3">
        <input
          id={`interest-${audience}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 min-w-0 flex-1 rounded-seal border border-ink/45 bg-paper px-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-ink/80"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-11 shrink-0 items-center rounded-seal border border-transparent bg-ink px-5 text-[14.5px] font-medium text-paper-raised hover:bg-ink-soft disabled:opacity-45"
        >
          {state === "sending" ? "Sending…" : "Notify me"}
        </button>
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>
      {state === "error" ? (
        <p className="mt-2 text-[13px] text-seal" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
