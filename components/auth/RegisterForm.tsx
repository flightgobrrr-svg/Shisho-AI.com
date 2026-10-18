"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

const INPUT_CLASS =
  "mt-2.5 h-11 w-full border border-ink/45 bg-paper-raised px-3.5 text-[14.5px] text-ink";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }

      if (data.needsConfirmation) {
        setNeedsConfirmation(true);
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setStatus("idle");
    }
  }

  if (needsConfirmation) {
    return (
      <div>
        <Logo />
        <h1 className="mt-6 font-display text-[26px] font-semibold text-ink">
          Check your email
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
          We&rsquo;ve sent a confirmation link to{" "}
          <strong className="text-ink">{email}</strong>. Follow it to finish
          setting up your account.
        </p>
        <p className="mt-7 border-t border-ink/10 pt-5 text-[13.5px] text-ink-soft">
          Already confirmed?{" "}
          <Link href="/login" className="text-ink underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <Logo />
      <h1 className="mt-6 font-display text-[26px] font-semibold text-ink">
        Create an account
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Your plan and free-trial usage follow your account, not this browser.
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

        <label htmlFor="password" className="label-mono mt-5 block text-ink-soft">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT_CLASS}
        />
        <p className="mt-2 text-[12.5px] text-ink-soft/70">At least 8 characters.</p>

        {error ? (
          <p role="alert" className="mt-3 text-[13.5px] text-seal">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={status === "pending"} className="mt-5 w-full">
          {status === "pending" ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-7 border-t border-ink/10 pt-5 text-[13.5px] text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="text-ink underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
