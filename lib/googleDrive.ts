/**
 * Google OAuth + Drive API wrapper for the templates feature — a visitor's
 * own single default template, picked from their Drive, used as read-only
 * style/structure grounding for the drafting agent
 * (app/api/assistant/route.ts). This is not a browse-a-folder feature: the
 * visitor's own office Drive has all their case files, drafts, and everything
 * else in it — Picker lets them point at exactly the one document they want
 * every future draft to follow, and that's the only Drive file this app ever
 * touches. This file only talks to Google; it has no Supabase import and no
 * knowledge of visitor ids, so it stays independently testable and can never
 * be pulled into a client bundle by way of the Supabase client (see
 * lib/driveConnection.ts for that half).
 *
 * `drive.file`, not `drive.readonly`: this only ever grants access to the one
 * file the visitor explicitly picks via Google Picker, never their whole
 * Drive — a visitor with years of case files in there should never need to
 * worry this app can see any of the rest. That's also what lets the Google
 * Cloud OAuth consent screen stay in "Testing" status (limited to test users
 * the developer adds) instead of needing Google's verification review.
 *
 * Env vars (see .env.example): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
 * Read lazily inside each function, never at module load — a build must
 * succeed even when these are unset; only an actual call should fail.
 */

import { google } from "googleapis";

export const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

function requireCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Google Drive is not configured — GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are unset.",
    );
  }
  return { clientId, clientSecret };
}

function newOAuthClient(redirectUri?: string) {
  const { clientId, clientSecret } = requireCredentials();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * `access_type: "offline"` + `prompt: "consent"` together guarantee Google
 * returns a refresh_token on every call, including a *reconnect* — Google
 * only issues one on a user's very first consent for a given app otherwise,
 * which would silently break re-connecting after a token is lost. The cost
 * is that reconnecting always re-shows the consent screen even to an
 * already-connected visitor; accepted trade-off, not an oversight.
 */
export function buildAuthUrl(redirectUri: string, state: string): string {
  const client = newOAuthClient(redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [DRIVE_FILE_SCOPE],
    state,
  });
}

export async function exchangeCodeForRefreshToken(
  code: string,
  redirectUri: string,
): Promise<string> {
  const client = newOAuthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    // Shouldn't happen given prompt=consent above, but a connection with no
    // way to ever refresh is worse than an explicit failure now.
    throw new Error("Google did not return a refresh token for this connection.");
  }
  return tokens.refresh_token;
}

export async function mintAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const client = newOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error("Google did not return an access token for this connection.");
  }
  const expiresIn = credentials.expiry_date
    ? Math.max(0, Math.round((credentials.expiry_date - Date.now()) / 1000))
    : 3600;
  return { accessToken: credentials.access_token, expiresIn };
}

function driveClient(accessToken: string) {
  const client = newOAuthClient();
  client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: client });
}

/**
 * Fetches one file's bytes, base64-encoded — the same shape a manually
 * uploaded chat attachment already arrives in (lib/assistant.ts's
 * UploadedFile), so the caller (app/api/drive/file/route.ts) can hand this
 * straight to lib/assistantFiles.ts's fileToContentBlock unchanged.
 *
 * Google Docs have no underlying binary file — they're exported instead of
 * downloaded, and exported specifically to text/plain rather than .docx: it
 * lands on the SAME "text/plain -> document/text block" path
 * fileToContentBlock already has, at the cost of losing heading/bold
 * formatting signal. An easy later upgrade (export to .docx instead) if that
 * signal turns out to matter — isolated to this one branch.
 */
export async function fetchFileContent(
  refreshToken: string,
  fileId: string,
  mimeType: string,
): Promise<{ dataBase64: string; mimeType: string }> {
  const { accessToken } = await mintAccessToken(refreshToken);
  const drive = driveClient(accessToken);

  const isGoogleDoc = mimeType === "application/vnd.google-apps.document";

  const { data } = isGoogleDoc
    ? await drive.files.export(
        { fileId, mimeType: "text/plain" },
        { responseType: "arraybuffer" },
      )
    : await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" },
      );

  const buffer = Buffer.from(data as ArrayBuffer);
  return {
    dataBase64: buffer.toString("base64"),
    mimeType: isGoogleDoc ? "text/plain" : mimeType,
  };
}
