import { clearSession, getDeviceId, getSession, saveSession, type Session } from "@/state/auth";

/**
 * The only place the app talks to the website's service.
 *
 * `EXPO_PUBLIC_API_URL` is the one public setting (the site's address). It is
 * baked into the app at build time and is not a secret. No key of any kind is
 * ever read, stored or sent from here other than the user's own tokens.
 *
 * Every failure is mapped to one of four honest kinds so a screen can say what
 * actually happened: not set up, offline, too slow, or refused by the server.
 */

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
export const apiConfigured = API_URL.length > 0;

export type ApiErrorKind = "config" | "offline" | "timeout" | "http";

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message);
  }
}

/** A plain-language message for any error, safe to show a person. */
export function describeError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.kind === "config") return "This app is not connected to Shisho's online service yet.";
    if (e.kind === "offline") return "You are offline, or the service cannot be reached. Check your connection and try again.";
    if (e.kind === "timeout") return "That took too long. Try again.";
    return e.message;
  }
  return "Something went wrong. Try again.";
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** "required": needs a signed-in session. "optional": send it if there is one. "none": never. */
  auth?: "required" | "optional" | "none";
  timeoutMs?: number;
};

async function send(path: string, opts: Options, session: Session | null): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);
  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "x-device-id": await getDeviceId(),
    };
    if (opts.body !== undefined) headers["content-type"] = "application/json";
    if (session && opts.auth !== "none") {
      headers.authorization = `Bearer ${session.accessToken}`;
      headers["x-refresh-token"] = session.refreshToken;
    }
    return await fetch(`${API_URL}/api/mobile${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if ((e as { name?: string })?.name === "AbortError") throw new ApiError("timeout", "Timed out");
    throw new ApiError("offline", "Network request failed");
  } finally {
    clearTimeout(timer);
  }
}

let refreshing: Promise<Session | null> | null = null;

/** Exchange the refresh token for a new session, once at a time. Signs out if it is refused. */
function refreshSession(): Promise<Session | null> {
  refreshing ??= (async () => {
    const current = getSession();
    if (!current) return null;
    try {
      const res = await send(
        "/auth/refresh",
        { method: "POST", body: { refreshToken: current.refreshToken }, auth: "none" },
        null,
      );
      if (!res.ok) {
        // Only a refusal ends the session; a network failure keeps it for next time.
        if (res.status === 401 || res.status === 400) clearSession();
        return null;
      }
      const data = (await res.json()) as { session: Session };
      saveSession(data.session);
      return data.session;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  if (!apiConfigured) throw new ApiError("config", "Not configured");
  const auth = opts.auth ?? "optional";

  let session = getSession();
  if (auth === "required" && !session) throw new ApiError("http", "Sign in to do that.", 401);

  // Refresh a little early so a request never starts with a token about to lapse.
  if (session && auth !== "none" && session.expiresAt - 60 < Date.now() / 1000) {
    session = (await refreshSession()) ?? session;
  }

  let res = await send(path, opts, session);

  if (res.status === 401 && session && auth !== "none") {
    const fresh = await refreshSession();
    if (fresh) res = await send(path, opts, fresh);
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? `The service answered with an error (${res.status}).`;
    throw new ApiError("http", message, res.status, data);
  }
  return data as T;
}
