"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

const INPUT_CLASS =
  "mt-2.5 h-11 w-full border border-ink/45 bg-paper-raised px-3.5 text-[14.5px] text-ink";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }

      setSent(true);
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setStatus("idle");
    }
  }

  if (sent) {
    return (
      <div>
        <Logo />
        <h1 className="mt-6 font-display text-[26px] font-semibold text-ink">
          Check your email
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
          If an account exists for <strong className="text-ink">{email}</strong>,
          a reset link is on its way.
        </p>
        <p className="mt-7 border-t border-ink/10 pt-5 text-[13.5px] text-ink-soft">
          <Link href="/login" className="text-ink underline underline-offset-2">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <Logo />
      <h1 className="mt-6 font-display text-[26px] font-semibold text-ink">
        Reset your password
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Enter the email on your account and we&rsquo;ll send a link to reset it.
      </p>

      <form onSubmit={onSubmit} className="mt-8">
        <label htmlFor="email" className="label-mono block text-ink-soft">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLASS}
        />

        {error ? (
          <p role="alert" className="mt-3 text-[13.5px] text-seal">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={status === "pending"} className="mt-5 w-full">
          {status === "pending" ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-7 border-t border-ink/10 pt-5 text-[13.5px] text-ink-soft">
        <Link href="/login" className="text-ink underline underline-offset-2">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
