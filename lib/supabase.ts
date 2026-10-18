import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only. The app never talks to Supabase from the browser — every
 * table access goes through a Next.js API route or server component, using
 * the service_role key, which bypasses Row Level Security entirely by
 * Supabase's own design. That is intentional here: this app's trust boundary
 * is "our server code decided this is safe," the same discipline
 * app/api/draft/route.ts already holds for entitlements. RLS in
 * supabase/schema.sql is a second, defence-in-depth boundary, not the one
 * this file relies on.
 *
 * Importing this file from a Client Component would throw at runtime
 * (SUPABASE_SERVICE_ROLE_KEY is unset in the browser bundle by design — it
 * carries no NEXT_PUBLIC_ prefix), not silently ship the key.
 */

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set — see .env.example.",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false }, // no browser session to persist; this is a server-only client
  });
  return client;
}
