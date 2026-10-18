"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

const INPUT_CLASS =
  "mt-2.5 h-11 w-full border border-ink/45 bg-paper-raised px-3.5 text-[14.5px] text-ink";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "That link may have expired.");
        return;
      }

      setDone(true);
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1500);
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setStatus("idle");
    }
  }

  if (done) {
    return (
      <div>
        <Logo />
        <h1 className="mt-6 font-display text-[26px] font-semibold text-ink">
          Password updated
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
          Taking you to your account…
        </p>
      </div>
    );
  }

  return (
    <div>
      <Logo />
      <h1 className="mt-6 font-display text-[26px] font-semibold text-ink">
        Choose a new password
      </h1>

      <form onSubmit={onSubmit} className="mt-8">
        <label htmlFor="password" className="label-mono block text-ink-soft">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT_CLASS}
        />
        <p className="mt-2 text-[12.5px] text-ink-faint">At least 8 characters.</p>

        {error ? (
          <p role="alert" className="mt-3 text-[13.5px] text-seal">
            {error}{" "}
            <Link href="/forgot-password" className="underline underline-offset-2">
              Request a new link
            </Link>
          </p>
        ) : null}

        <Button type="submit" disabled={status === "pending"} className="mt-5 w-full">
          {status === "pending" ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
