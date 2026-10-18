import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/authSession";
import { getUserPlan } from "@/lib/profile";
import { PLAN_LABELS } from "@/lib/entitlements";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Your account",
};

/**
 * Server Component reading the session directly via `next/headers`'s
 * `cookies()` — safe here specifically because this is a single leaf page,
 * not the root layout (see lib/authSession.ts's own comment on why
 * getSessionUser takes a cookie-header string rather than a Request, and
 * HANDOFF.md's gotcha on why the ROOT layout must never do this).
 */
export default async function AccountPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const { user } = await getSessionUser(cookieHeader);

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserPlan(user.id);

  return (
    <AuthCard>
      <Logo />
      <h1 className="mt-6 font-display text-[26px] font-semibold text-ink">Your account</h1>

      <dl className="mt-8 space-y-5 border-t border-ink/10 pt-6">
        <div>
          <dt className="label-mono text-ink-faint">Email</dt>
          <dd className="mt-1 text-[14.5px] text-ink">{user.email}</dd>
        </div>
        <div>
          <dt className="label-mono text-ink-faint">Plan</dt>
          <dd className="mt-1 text-[14.5px] text-ink">{PLAN_LABELS[plan]}</dd>
        </div>
      </dl>

      <SignOutButton className="mt-8 w-full" />
    </AuthCard>
  );
}
