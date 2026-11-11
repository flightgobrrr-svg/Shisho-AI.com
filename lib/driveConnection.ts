import { supabase } from "@/lib/supabase";
import type { DriveTemplateFile } from "@/lib/driveTemplate";

/**
 * Supabase persistence for a visitor's Google Drive connection
 * (supabase/schema.sql's google_drive_connections table) — the Drive-side
 * counterpart to lib/usageCounters.ts, keyed on the exact same visitor_id
 * cookie. Server-only: importing this from a "use client" file would try to
 * pull in lib/supabase.ts's service_role key, which is unset in the browser
 * bundle by design and would throw rather than silently ship it.
 *
 * The DB columns are still named folder_id/folder_name (they were written
 * before this became a single-default-template feature rather than a
 * browse-a-folder one) — repurposed here to hold one file's id/name rather
 * than renamed, so as not to demand a second Supabase migration for what is
 * genuinely just a naming detail. `files` still holds a one-element array
 * (not renamed to `file`) since app/api/drive/file/route.ts already looks
 * templates up by id in an array; keeping that shape meant that route
 * needed zero changes for this rework.
 *
 * Unlike usage counts, a missing or broken connection is not a quota to fail
 * open on — getConnection still returns null on a read error (a transient
 * Supabase hiccup should render /draft-bot as "not connected yet", not crash
 * the page), but the two write functions throw, since silently swallowing a
 * failed token/template save would leave the visitor believing they're
 * connected when nothing was actually persisted.
 */

export type DriveConnection = {
  refreshToken: string;
  templateFileId: string | null;
  templateName: string | null;
  files: DriveTemplateFile[];
};

export async function getConnection(visitorId: string): Promise<DriveConnection | null> {
  const { data, error } = await supabase()
    .from("google_drive_connections")
    .select("refresh_token, folder_id, folder_name, files")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (error) {
    console.error("[driveConnection] read failed, treating as not connected:", error);
    return null;
  }
  if (!data) return null;

  return {
    refreshToken: data.refresh_token,
    templateFileId: data.folder_id,
    templateName: data.folder_name,
    files: (data.files ?? []) as DriveTemplateFile[],
  };
}

/**
 * Upserts ONLY visitor_id/refresh_token/updated_at — deliberately not the
 * template columns. PostgREST's upsert only touches the columns present in
 * the payload on conflict, so reconnecting (a fresh OAuth round trip)
 * refreshes the token without wiping out a template the visitor already
 * chose. Omitting them here is load-bearing, not an oversight — do not
 * "complete" this object with them.
 */
export async function saveRefreshToken(visitorId: string, refreshToken: string): Promise<void> {
  const { error } = await supabase()
    .from("google_drive_connections")
    .upsert(
      {
        visitor_id: visitorId,
        refresh_token: refreshToken,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "visitor_id" },
    );

  if (error) {
    throw new Error(`[driveConnection] failed to save refresh token: ${error.message}`);
  }
}

/** A plain update, not an upsert — a default template can only ever be
 *  chosen after a connection row already exists (Picker needs an access
 *  token minted from an already-stored refresh token), so there is always a
 *  row to update by the time this is called. */
export async function saveDefaultTemplate(
  visitorId: string,
  file: DriveTemplateFile,
): Promise<void> {
  const { error } = await supabase()
    .from("google_drive_connections")
    .update({
      folder_id: file.id,
      folder_name: file.name,
      files: [file],
      updated_at: new Date().toISOString(),
    })
    .eq("visitor_id", visitorId);

  if (error) {
    throw new Error(`[driveConnection] failed to save default template: ${error.message}`);
  }
}
