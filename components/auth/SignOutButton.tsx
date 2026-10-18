"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/ui/Button";

export function SignOutButton({
  className,
  variant = "ghost",
}: {
  className?: string;
  variant?: ButtonVariant;
}) {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    globalThis.location.href = "/";
  }

  return (
    <Button type="button" variant={variant} size="sm" onClick={signOut} disabled={pending} className={className}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
