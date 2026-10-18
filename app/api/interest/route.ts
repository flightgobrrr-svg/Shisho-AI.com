import { NextResponse } from "next/server";
import { PLANNED_AUDIENCES } from "@/lib/audiences";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/usageCounters";

/**
 * POST /api/interest — { email, audience, website } -> stores one row so the
 * visitor can be told when a planned audience's feature opens.
 *
 * `website` is a honeypot: a real visitor never sees or fills it, so a filled
 * value is answered with a quiet success and nothing is stored. Answers 503
 * until supabase/schema.sql's interest_signups table exists, rather than
 * pretending the address was saved.
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const { email, audience, website } = (body ?? {}) as {
    email?: unknown;
    audience?: unknown;
    website?: unknown;
  };

  if (typeof website === "string" && website !== "") {
    return NextResponse.json({ ok: true });
  }

  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (typeof audience !== "string" || !PLANNED_AUDIENCES.some((a) => a.slug === audience)) {
    return NextResponse.json({ error: "Unknown audience." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Sign-up is not open yet." }, { status: 503 });
  }

  const { error } = await supabase()
    .from("interest_signups")
    .upsert(
      { email: email.trim().toLowerCase(), audience },
      { onConflict: "email,audience", ignoreDuplicates: true },
    );

  if (error) {
    console.error("[interest] insert failed:", error.code);
    return NextResponse.json({ error: "Sign-up is not open yet." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
