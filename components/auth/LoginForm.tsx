"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

const INPUT_CLASS =
  "mt-2.5 h-11 w-full border border-ink/45 bg-paper-raised px-3.5 text-[14.5px] text-ink";

export function LoginForm({ initialError }: { initialError?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "pending">("idle");
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div>
      <Logo />
      <h1 className="mt-6 font-display text-[26px] font-semibold text-ink">Sign in</h1>

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

        <div className="mt-5 flex items-baseline justify-between">
          <label htmlFor="password" className="label-mono block text-ink-soft">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-[12.5px] text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT_CLASS}
        />

        {error ? (
          <p role="alert" className="mt-3 text-[13.5px] text-seal">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={status === "pending"} className="mt-5 w-full">
          {status === "pending" ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-7 border-t border-ink/10 pt-5 text-[13.5px] text-ink-soft">
        Don&rsquo;t have an account?{" "}
        <Link href="/register" className="text-ink underline underline-offset-2">
          Create one
        </Link>
      </p>
    </div>
  );
}
