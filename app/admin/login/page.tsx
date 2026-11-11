import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Plain HTML form, no client JS — POSTs straight to /api/admin/login.
 * This is an internal tool behind a single shared secret (see
 * lib/adminAuth.ts); it doesn't need the marketing site's motion or chrome,
 * and app/layout.tsx's ChromeGate hides EntryGate/Nav/Footer/CustomCursor
 * for every /admin route specifically so this page isn't buried under the
 * mandatory audience-picker splash.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const failed = params.error === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="label-mono text-ink-soft">Shisho AI</p>
        <h1 className="mt-3 font-display text-[26px] font-semibold text-ink">
          Review queue
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Shared secret only — see REVIEW_SECRET in .env.local.
        </p>

        <form action="/api/admin/login" method="POST" className="mt-8">
          <label htmlFor="secret" className="label-mono block text-ink-soft">
            Secret
          </label>
          <input
            id="secret"
            name="secret"
            type="password"
            required
            autoFocus
            className="mt-2.5 h-11 w-full border border-ink/45 bg-paper-raised px-3.5 text-[14.5px] text-ink"
          />
          {failed && (
            <p className="mt-3 text-[13.5px] text-seal">
              That secret didn&rsquo;t match. Try again.
            </p>
          )}
          <Button type="submit" className="mt-5 w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
