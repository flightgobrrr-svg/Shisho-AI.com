import * as DocumentPicker from "expo-document-picker";
import * as LegacyFileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { API_URL, ApiError, api } from "@/api/client";
import { getDeviceId, getSession } from "@/state/auth";
import { readPickedFile } from "@/features/attachments";
import type { Confidence, FieldKey, OutputFormat, OutputLanguage, Role, Verification } from "@/lib/clerkWork";
import type { RegisterKind, TaskSlot, TaskStatus } from "@/lib/clerkRegisters";

/** Advocate Clerk Work endpoints (app/api/mobile/clerk/*). Every call needs a signed-in session. */

export type Office = { id: string; name: string; state: string | null; district: string | null; role: Role };
export type MatterSummary = {
  id: string;
  serial_no: number;
  file_code: string | null;
  parent_id: string | null;
  cause_title: string | null;
  case_label: string | null;
  court: string | null;
  cnr: string | null;
  client: string | null;
  advocate: string | null;
  next_hearing: string | null;
  next_hearing_on?: string | null;
  restricted?: boolean;
  office_id?: string;
  updated_at: string;
};
export type FieldRow = {
  id: string;
  upload_id: string | null;
  key: FieldKey;
  value: string;
  page: number | null;
  quote: string | null;
  confidence: Confidence | null;
  status: Verification;
  chosen: boolean;
  as_of: string | null;
  decided_by: string | null;
  decided_at: string | null;
};
export type UploadRow = { id: string; kind: "case_data" | "blank_form"; filename: string; mime_type: string; bytes: number; pages: number | null; status: "stored" | "processing" | "extracted" | "failed"; error: string | null; created_at: string };
export type DocumentRow = { id: string; work_no: number; version: number; status: "draft" | "ready_for_execution"; pdf_name: string | null; docx_name: string | null; created_at: string; created_by: string | null; approved_by: string | null; approved_at: string | null };
export type HistoryRow = { action: string; actor: string | null; detail: Record<string, unknown>; at: string };
export type CaseSheet = {
  matter: MatterSummary;
  role: Role;
  parent: { id: string; serial_no: number; case_label: string | null } | null;
  connected: { id: string; serial_no: number; case_label: string | null; cause_title: string | null }[];
  fields: FieldRow[];
  conflicts: FieldKey[];
  missing: FieldKey[];
  uploads: UploadRow[];
  documents: DocumentRow[];
  history: HistoryRow[];
  hearings: HearingRow[];
  tasks: { id: string; title: string; status: TaskStatus; slot: TaskSlot | null; due_on: string | null; assigned_to: string | null; work_no: number | null }[];
  entryCounts: Record<string, number>;
  people: Record<string, string>;
};
export type HearingRow = { id: string; hearing_on: string; purpose: string | null; result: string; source: "clerk_report" | "court_order"; next_on: string | null; next_purpose: string | null; directions: string | null; confirmed_at: string | null; created_at: string };
export type TaskRow = { id: string; office_id: string; matter_id: string | null; work_no: number | null; title: string; notes: string | null; status: TaskStatus; slot: TaskSlot | null; due_on: string | null; assigned_to: string | null; created_by: string | null; created_at: string; updated_at: string };
export type EntryRowApi = { id: string; matter_id: string | null; kind: RegisterKind; entry_date: string | null; status: string | null; amount: number | null; data: Record<string, string>; created_at: string };
export type DayMatter = { serial: number; fileCode: string; court: string; caseLabel: string; causeTitle: string; client: string; capacity: string; advocate: string; purpose: string; stage: string; source: string };
export type DayTask = { serial: number | null; caseLabel: string; title: string; status: TaskStatus; slot: TaskSlot | null; due: string | null; assignee: string; workNo: number | null; updatedOn: string };
export type Dashboard = {
  date: string;
  tomorrow: string;
  today: DayMatter[];
  tomorrowMatters: DayMatter[];
  tasks: { open: number; overdue: DayTask[]; byStatus: Record<string, number>; byPerson: { name: string; open: number; overdue: number }[]; prepare: DayTask[]; deadlines: DayTask[]; completedToday: number };
  registers: { kind: RegisterKind; title: string; open: number }[];
  attendance: { kind: string; data: Record<string, string>; entry_date: string | null; serial?: number | null; case_label?: string | null }[];
  missingReceipts: { kind: string; data: Record<string, string>; entry_date: string | null; amount: number | null; serial?: number | null; case_label?: string | null }[];
  unconfirmed: { id: string; serial: number; caseLabel: string; hearingOn: string; result: string; nextOn: string | null }[];
  overlaps: { advocate: string; matters: { serial: number; court: string; caseLabel: string }[] }[];
};
export type TemplateRow = { id: string; work_no: number; name: string; forum: string | null; state: string | null; district: string | null; proceeding_type: string | null; language: string; version: number; status: "active" | "archived"; created_by: string | null; created_at: string; approved_by: string | null; approved_at: string | null; last_reviewed_at: string | null; fields: number };
export type OfficeDoc = { id: string; work_no: number; version: number; status: DocumentRow["status"]; pdf_name: string | null; docx_name: string | null; created_at: string };
export type Blank = { id: string; page: number; label: string; after: string; protected: boolean; target: string; targetLabel: string; reason: string; value: string };
export type FormMap = { pages: number; hasDocket: boolean; template: { id: string; name: string; version: number; approved: boolean } | null; blanks: Blank[] };
export type SourceLine = { field: string; value: string; source: string; page: number | null; confidence: string | null; status: string };
export type Report = {
  filled: { id: string; target: string; value: string; page: number }[];
  leftBlank: { id: string; page: number; label: string; why: string }[];
  continued: { note: number; id: string; target: string; value: string }[];
  unprintable: string[];
  sources: SourceLine[];
  docketAdded: boolean;
  pageCount: number;
  warnings?: string[];
};
export type DocumentDetail = {
  document: { id: string; workNo: number; version: number; status: DocumentRow["status"]; pdfName: string | null; docxName: string | null; options: { filingDate?: string; language?: string; format?: string; documentName?: string; instructions?: string; redact?: boolean }; inputs: Record<string, string | string[][]>; report: Report; createdAt: string; createdBy: string; approvedAt: string | null; approvedBy: string | null };
  matter: { id: string; serial_no: number; case_label: string | null; cause_title: string | null } | null;
  officeId: string;
  versions: { id: string; version: number; status: DocumentRow["status"]; created_at: string }[];
  role: Role;
};
export type Member = { user_id: string; role: Role; active: boolean; email: string };

const LONG = 300_000;

export const clerk = {
  offices: () => api<{ offices: Office[] }>("/clerk/offices", { auth: "required" }),
  createOffice: (b: { name: string; state?: string; district?: string }) => api<{ office: Office }>("/clerk/offices", { method: "POST", body: b, auth: "required" }),
  members: (office: string) => api<{ members: Member[] }>(`/clerk/offices/${office}/members`, { auth: "required" }),
  setMember: (office: string, b: { email: string; role?: Role; remove?: boolean }) => api<{ ok: true }>(`/clerk/offices/${office}/members`, { method: "POST", body: b, auth: "required" }),
  matters: (office: string, q = "") => api<{ matters: MatterSummary[] }>(`/clerk/offices/${office}/matters${q ? `?q=${encodeURIComponent(q)}` : ""}`, { auth: "required" }),
  createMatter: (office: string, b: { fileCode?: string; parentSerial?: string }) => api<{ matter: MatterSummary }>(`/clerk/offices/${office}/matters`, { method: "POST", body: b, auth: "required" }),
  sheet: (matter: string) => api<CaseSheet>(`/clerk/matters/${matter}`, { auth: "required" }),
  setFileCode: (matter: string, fileCode: string) => api<{ ok: true }>(`/clerk/matters/${matter}`, { method: "PATCH", body: { fileCode }, auth: "required" }),
  upload: (matter: string, kind: UploadRow["kind"], file: { filename: string; mimeType: string; dataBase64: string }) =>
    api<{ upload: { id: string }; reading: { fields: number; documentKind: string; documentDate: string } | null; readError: string | null }>(`/clerk/matters/${matter}/uploads`, { method: "POST", body: { kind, file }, auth: "required", timeoutMs: LONG }),
  retry: (upload: string) => api<{ reading: { fields: number } }>(`/clerk/uploads/${upload}/extract`, { method: "POST", body: {}, auth: "required", timeoutMs: LONG }),
  confirm: (matter: string, fieldId: string) => api<{ ok: true }>(`/clerk/matters/${matter}/fields`, { method: "POST", body: { action: "confirm", fieldId }, auth: "required" }),
  correct: (matter: string, key: FieldKey, value: string) => api<{ ok: true }>(`/clerk/matters/${matter}/fields`, { method: "POST", body: { action: "correct", key, value }, auth: "required" }),
  mapForm: (matter: string, b: { uploadId: string; workNo: number; filingDate?: string; documentName?: string }) => api<FormMap>(`/clerk/matters/${matter}/form`, { method: "POST", body: b, auth: "required", timeoutMs: 60_000 }),
  generate: (matter: string, b: GenerateBody) => api<GenerateResult>(`/clerk/matters/${matter}/generate`, { method: "POST", body: b, auth: "required", timeoutMs: LONG }),
  generateOffice: (office: string, b: GenerateBody) => api<GenerateResult>(`/clerk/offices/${office}/generate`, { method: "POST", body: b, auth: "required", timeoutMs: LONG }),
  document: (id: string) => api<DocumentDetail>(`/clerk/documents/${id}`, { auth: "required" }),
  approve: (id: string) => api<{ ok: true }>(`/clerk/documents/${id}`, { method: "POST", body: { action: "approve" }, auth: "required", timeoutMs: LONG }),

  office: (office: string) => api<{ office: Office & { retention_days: number | null } }>(`/clerk/offices/${office}`, { auth: "required" }),
  setRetention: (office: string, retentionDays: number | null) => api<{ ok: true }>(`/clerk/offices/${office}`, { method: "PATCH", body: { retentionDays }, auth: "required" }),
  dashboard: (office: string, date?: string) => api<{ dashboard: Dashboard; role: Role }>(`/clerk/offices/${office}/dashboard${date ? `?date=${date}` : ""}`, { auth: "required" }),
  officeDocuments: (office: string) => api<{ documents: OfficeDoc[] }>(`/clerk/offices/${office}/documents`, { auth: "required" }),

  tasks: (office: string, f: { matter?: string; open?: boolean; mine?: boolean } = {}) =>
    api<{ tasks: TaskRow[]; matters: Record<string, { serial: number; caseLabel: string | null }>; people: Record<string, string> }>(
      `/clerk/offices/${office}/tasks?${[f.matter ? `matter=${f.matter}` : "", f.open ? "open=1" : "", f.mine ? "mine=1" : ""].filter(Boolean).join("&")}`,
      { auth: "required" },
    ),
  createTask: (office: string, b: { title: string; matterId?: string; workNo?: number; due?: string; slot?: TaskSlot; assignTo?: string; notes?: string }) => api<{ task: TaskRow }>(`/clerk/offices/${office}/tasks`, { method: "POST", body: b, auth: "required" }),
  task: (id: string) => api<{ task: TaskRow; events: { status: TaskStatus; note: string | null; actor: string | null; at: string }[]; people: Record<string, string> }>(`/clerk/tasks/${id}`, { auth: "required" }),
  updateTask: (id: string, b: { status?: TaskStatus; note?: string; assignTo?: string | null; due?: string | null; slot?: TaskSlot | null; title?: string; notes?: string }) => api<{ task: TaskRow }>(`/clerk/tasks/${id}`, { method: "PATCH", body: b, auth: "required" }),
  deleteTask: (id: string) => api<{ ok: true }>(`/clerk/tasks/${id}`, { method: "DELETE", auth: "required" }),

  recordHearing: (matter: string, b: { hearingOn: string; result: string; source: "clerk_report" | "court_order"; nextOn?: string; nextPurpose?: string; directions?: string }) => api<{ id: string }>(`/clerk/matters/${matter}/hearings`, { method: "POST", body: b, auth: "required" }),
  confirmHearing: (id: string, b: { result?: string; nextOn?: string; nextPurpose?: string; directions?: string } = {}) => api<{ ok: true; corrected: boolean }>(`/clerk/hearings/${id}`, { method: "POST", body: { action: "confirm", ...b }, auth: "required" }),

  entries: (office: string, kind: RegisterKind, matter?: string) => api<{ entries: EntryRowApi[]; matters: Record<string, { serial: number; caseLabel: string | null }> }>(`/clerk/offices/${office}/entries?kind=${kind}${matter ? `&matter=${matter}` : ""}`, { auth: "required" }),
  createEntry: (office: string, b: { kind: RegisterKind; matterId?: string; data: Record<string, string> }) => api<{ entry: EntryRowApi }>(`/clerk/offices/${office}/entries`, { method: "POST", body: b, auth: "required" }),
  updateEntry: (id: string, data: Record<string, string>) => api<{ entry: EntryRowApi }>(`/clerk/entries/${id}`, { method: "PATCH", body: { data }, auth: "required" }),
  deleteEntry: (id: string) => api<{ ok: true }>(`/clerk/entries/${id}`, { method: "DELETE", auth: "required" }),

  templates: (office: string) => api<{ templates: TemplateRow[]; people: Record<string, string>; role: Role }>(`/clerk/offices/${office}/templates`, { auth: "required" }),
  templateAction: (id: string, action: "approve" | "archive" | "activate" | "reviewed") => api<{ ok: true }>(`/clerk/templates/${id}`, { method: "POST", body: { action }, auth: "required" }),

  access: (matter: string) => api<{ restricted: boolean; members: { userId: string; email: string }[] }>(`/clerk/matters/${matter}/access`, { auth: "required" }),
  setAccess: (matter: string, b: { restricted?: boolean; add?: string; remove?: string }) => api<{ ok: true }>(`/clerk/matters/${matter}/access`, { method: "POST", body: b, auth: "required" }),
  deleteMatter: (matter: string) => api<{ ok: true }>(`/clerk/matters/${matter}`, { method: "DELETE", auth: "required" }),
  deleted: (office: string) => api<{ matters: { id: string; serial_no: number; case_label: string | null; cause_title: string | null; deleted_at: string }[]; retentionDays: number | null }>(`/clerk/offices/${office}/deleted`, { auth: "required" }),
  restore: (matter: string, action: "restore" | "purge" = "restore") => api<{ ok: true }>(`/clerk/matters/${matter}/restore`, { method: "POST", body: { action }, auth: "required" }),
};

export type GenerateBody = {
  workNo: number;
  inputs?: Record<string, string | string[][]>;
  uploadId?: string;
  mapping?: Record<string, string>;
  filingDate?: string;
  language: OutputLanguage;
  format: OutputFormat;
  documentName?: string;
  instructions?: string;
  saveTemplate?: boolean;
  redact?: boolean;
};
export type GenerateResult = { document: { id: string; version: number }; report: Report; filed: { entries: number; skipped: string[]; hearing: boolean } };

/**
 * Downloads a generated file through the authenticated route and opens the
 * share sheet (print, Drive, WhatsApp, a PDF or Word app). The file is never
 * reachable by a public link.
 */
export async function shareDocument(id: string, kind: "pdf" | "docx", filename: string) {
  // A quick authenticated call first, so an expiring token is refreshed before the download.
  await clerk.document(id);
  const session = getSession();
  if (!session) throw new ApiError("http", "Sign in to do that.", 401);
  const target = `${LegacyFileSystem.cacheDirectory}${filename.replace(/[^\w.-]/g, "_")}`;
  const res = await LegacyFileSystem.downloadAsync(`${API_URL}/api/mobile/clerk/documents/${id}/file?kind=${kind}`, target, {
    headers: { authorization: `Bearer ${session.accessToken}`, "x-refresh-token": session.refreshToken, "x-device-id": await getDeviceId() },
  });
  if (res.status !== 200) throw new ApiError("http", "The file could not be downloaded. Try again.", res.status);
  if (!(await Sharing.isAvailableAsync())) throw new ApiError("http", "Sharing is not available on this device.");
  await Sharing.shareAsync(res.uri, {
    mimeType: kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    dialogTitle: filename,
    UTI: kind === "pdf" ? "com.adobe.pdf" : "org.openxmlformats.wordprocessingml.document",
  });
}

const MAX = 15_000_000;
export type Picked = { filename: string; mimeType: string; dataBase64: string; size: number };

/** Case papers: PDF or a photo. Blank forms: PDF only. */
export async function pickClerkFile(kind: UploadRow["kind"]): Promise<{ kind: "ok"; file: Picked } | { kind: "cancelled" } | { kind: "error"; message: string }> {
  const types = kind === "blank_form" ? ["application/pdf"] : ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  let result: DocumentPicker.DocumentPickerResult;
  try {
    result = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true, multiple: false });
  } catch {
    return { kind: "error", message: "The file picker could not open." };
  }
  if (result.canceled || !result.assets?.[0]) return { kind: "cancelled" };
  const a = result.assets[0];
  const ext = a.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = a.mimeType && types.includes(a.mimeType) ? a.mimeType : ({ pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" } as Record<string, string>)[ext];
  if (!mimeType || !types.includes(mimeType)) return { kind: "error", message: kind === "blank_form" ? "A blank form must be a PDF." : "Choose a PDF or a photo." };
  if (a.size != null && a.size > MAX) return { kind: "error", message: "Keep the file under 15 MB." };
  try {
    const dataBase64 = await readPickedFile(a.uri);
    return { kind: "ok", file: { filename: a.name, mimeType, dataBase64, size: a.size ?? Math.floor((dataBase64.length * 3) / 4) } };
  } catch {
    return { kind: "error", message: "That file could not be read. Try another copy of it." };
  }
}
