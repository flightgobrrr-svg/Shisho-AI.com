import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, isValidSession } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabase";
import { ReviewQueue, type PendingCase } from "@/components/admin/ReviewQueue";

export const metadata: Metadata = {
  title: "Review queue",
  robots: { index: false, follow: false },
};

/**
 * Re-checks the session itself rather than trusting proxy.ts alone — see
 * proxy.ts's own comment for why (Next's own guidance: a matcher change
 * later could silently drop coverage without this second check noticing).
 * This also opts the route into dynamic rendering (cookies() does that
 * automatically), which is exactly right for a per-request-gated page.
 */
export default async function AdminReviewPage() {
  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSession(session)) redirect("/admin/login");

  const db = supabase();
  const [{ data: cases, error: casesError }, { data: courts, error: courtsError }] =
    await Promise.all([
      db
        .from("cases")
        .select("id, title, citation, court_id, topic, decision_date, source_url")
        .eq("status", "pending_review")
        .order("ingested_at", { ascending: false }),
      db.from("courts").select("id, name").order("name"),
    ]);

  if (casesError || courtsError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-display text-[19px] font-semibold text-ink">
          Couldn&rsquo;t load the queue.
        </p>
        <p className="mt-3 text-[14px] text-ink-soft">
          {casesError?.message ?? courtsError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="label-mono text-ink-soft">Shisho AI · Admin</p>
          <h1 className="mt-2 font-display text-[26px] font-semibold text-ink">
            Review queue
          </h1>
          <p className="mt-2 text-[14px] text-ink-soft">
            {(cases as PendingCase[] | null)?.length ?? 0} pending. Nothing here is
            public until you approve it.
          </p>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="label-mono underline-draw text-ink-soft">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-10">
        <ReviewQueue initialCases={(cases as PendingCase[] | null) ?? []} courts={courts ?? []} />
      </div>
    </div>
  );
}
