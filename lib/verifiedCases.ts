import { supabase } from "@/lib/supabase";
import { isCategory, type PreviewCase } from "@/lib/library";

/**
 * The public Library's Supabase half — cases the review queue
 * (app/admin/review) has moved to status='verified'. Fetched fresh on every
 * /library request: this project has no caching layer for it yet, traffic
 * is low pre-launch, and a reviewer who just approved a case wants it live
 * immediately, not after some revalidation window.
 *
 * `tags text[]` (supabase/schema.sql) holds the category — reused rather
 * than adding a column, since it was already provisioned and unused. The
 * review queue writes exactly one tag: one of lib/library.ts's own
 * CATEGORIES, so the same six-category filter that already works for the
 * static 31 cases keeps working here with no changes to that logic at all.
 *
 * Fails soft, not loud: if Supabase is unreachable or unconfigured (env
 * vars unset — a real possibility in any environment without a Supabase
 * project wired up), the public Library still renders with just the static
 * cases. A missing Supabase connection should never be the reason the
 * Library page itself goes down.
 */
export async function fetchVerifiedCases(): Promise<PreviewCase[]> {
  try {
    const db = supabase();
    const [{ data: cases, error: casesError }, { data: courts, error: courtsError }] =
      await Promise.all([
        db
          .from("cases")
          .select("title, citation, topic, court_id, tags")
          .eq("status", "verified"),
        db.from("courts").select("id, name"),
      ]);

    if (casesError || courtsError || !cases || !courts) {
      console.error(
        "[library] Supabase verified-cases fetch failed:",
        casesError?.message ?? courtsError?.message,
      );
      return [];
    }

    const courtNameById = new Map(courts.map((c) => [c.id, c.name]));

    return cases.flatMap((row): PreviewCase[] => {
      const court = courtNameById.get(row.court_id);
      const category = row.tags?.find(isCategory);

      // status='verified' already guarantees title/citation/topic are
      // non-null — supabase/schema.sql's own CHECK constraint enforces
      // that at the database level. `category` is the one field that
      // constraint doesn't cover (it lives in `tags`, added after that
      // constraint was written), so a verified row approved before this
      // feature existed could genuinely lack one — skip it rather than
      // guess a category, the same "don't invent it" rule as everywhere
      // else in this file's data.
      if (!row.title || !row.citation || !row.topic || !court || !category) return [];

      return [{ title: row.title, citation: row.citation, court, topic: row.topic, category }];
    });
  } catch (err) {
    console.error("[library] Supabase unavailable, showing static cases only:", err);
    return [];
  }
}
