import { api } from "@/api/client";
import type { Session } from "@/state/auth";

/** Typed wrappers for each endpoint. The shapes mirror app/api/mobile/* and the website's handlers. */

export type Plan = "free" | "core" | "proficient" | "addon";

export type SignInResult = { session: Session; plan: Plan };
export type RegisterResult =
  | { session: Session; plan: Plan; confirmEmail: false }
  | { session: null; confirmEmail: true };

export const signIn = (email: string, password: string) =>
  api<SignInResult>("/auth/login", { method: "POST", body: { email, password }, auth: "none" });

export const register = (email: string, password: string) =>
  api<RegisterResult>("/auth/register", { method: "POST", body: { email, password }, auth: "none" });

export const forgotPassword = (email: string) =>
  api<{ ok: true }>("/auth/forgot", { method: "POST", body: { email }, auth: "none" });

export const fetchMe = () => api<{ user: { id: string; email: string }; plan: Plan }>("/me", { auth: "required" });

export const deleteAccount = () => api<{ ok: true }>("/auth/delete", { method: "POST", auth: "required" });

/* ---- Shisho ---- */

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AssistantReply = {
  mode: "demo" | "live";
  reply: string;
  draft: string | null;
  docType: string | null;
};

export type FilePayload = { filename: string; mimeType: string; dataBase64: string };

export const askShisho = (messages: ChatTurn[], file?: FilePayload, docType?: string) =>
  api<AssistantReply>("/assistant", {
    method: "POST",
    body: { messages, ...(file ? { file } : {}), ...(docType ? { context: { docType } } : {}) },
    // A file makes the request larger and the model slower.
    timeoutMs: file ? 150_000 : 90_000,
  });

export type Annotation = {
  id: string;
  anchor: string;
  severity: "must-fix" | "consider" | "good";
  note: string;
  authority?: string;
};

export const reviewDraft = (draft: string, docType: string) =>
  api<{ mode: "demo" | "live"; annotations: Annotation[] }>("/review", {
    method: "POST",
    body: { draft, docType },
    timeoutMs: 90_000,
  });

/* ---- Library ---- */

export type Digest = Record<string, unknown> & { mode?: "demo" | "live"; generatedAt?: string };

export type DigestResult = {
  title: string;
  citation?: string | null;
  court?: string;
  sourceUrl: string;
  digest: Digest;
};

export const fetchDigest = (slug: string) =>
  api<DigestResult>(`/digest/${encodeURIComponent(slug)}`, { auth: "none", timeoutMs: 90_000 });

export const lookupJudgment = (q: string) =>
  api<DigestResult>(`/lookup?q=${encodeURIComponent(q)}`, { auth: "required", timeoutMs: 120_000 });

/* ---- Who it's for ---- */

/** "Tell me when this opens" for a planned audience. The site's own handler. */
export const registerInterest = (email: string, audience: string) =>
  api<{ ok: true }>("/interest", { method: "POST", body: { email, audience, website: "" }, auth: "none" });
