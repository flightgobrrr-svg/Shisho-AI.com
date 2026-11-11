import { Alert } from "react-native";
import * as LegacyFileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { API_URL, ApiError, apiConfigured } from "@/api/client";
import { getDeviceId } from "@/state/auth";

/**
 * Download or print a draft (or review notes) in the MSN format. The server
 * turns the text into the file (app/api/mobile/export); the phone saves it to
 * its cache, then opens the share sheet (to save to Files or Drive, or send)
 * or the system print dialog.
 */
async function fetchFile(title: string, text: string, format: "docx" | "pdf"): Promise<{ path: string; name: string }> {
  if (!apiConfigured) throw new ApiError("config", "Not configured");
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/mobile/export`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-device-id": await getDeviceId() },
      body: JSON.stringify({ title, text, format }),
    });
  } catch {
    throw new ApiError("offline", "Network request failed");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError("http", data?.error ?? "The file could not be made. Try again.", res.status);
  }
  const name = (res.headers.get("x-filename") ?? `Shisho_draft.${format}`).replace(/[^\w.-]/g, "_");
  const base64 = await new Promise<string>((resolve, reject) => {
    res.blob().then((blob) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    }, reject);
  });
  const path = `${LegacyFileSystem.cacheDirectory}${name}`;
  await LegacyFileSystem.writeAsStringAsync(path, base64, { encoding: LegacyFileSystem.EncodingType.Base64 });
  return { path, name };
}

export async function downloadText(title: string, text: string, format: "docx" | "pdf") {
  const { path, name } = await fetchFile(title, text, format);
  if (!(await Sharing.isAvailableAsync())) throw new ApiError("http", "Saving files is not available on this device.");
  await Sharing.shareAsync(path, {
    mimeType: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    dialogTitle: name,
    UTI: format === "pdf" ? "com.adobe.pdf" : "org.openxmlformats.wordprocessingml.document",
  });
}

/** The Shisho printer artwork, shown on every Print button. */
export const PRINT_ICON = require("../../assets/print-icon.png");

/** Opens the print dialog with the MSN-format PDF, the same pages as the PDF download. */
export async function printText(title: string, text: string) {
  const { path } = await fetchFile(title, text, "pdf");
  await Print.printAsync({ uri: path });
}

/** Prints; `onError` gets a message to show. */
export function printWithErrors(title: string, text: string, onError: (message: string) => void) {
  printText(title, text).catch((e: unknown) => onError(errorMessage(e, "The draft could not be printed. Try again.")));
}

const errorMessage = (e: unknown, fallback: string) =>
  e instanceof ApiError && e.kind === "offline" ? "You are offline. Connect and try again." : e instanceof Error ? e.message : fallback;

/** Asks Word or PDF, then downloads. `onError` gets a message to show. */
export function chooseAndDownload(title: string, text: string, onError: (message: string) => void) {
  const go = (format: "docx" | "pdf") => {
    downloadText(title, text, format).catch((e: unknown) => onError(errorMessage(e, "The file could not be made. Try again.")));
  };
  Alert.alert("Download", "Save this as a file you can open, print or send.", [
    { text: "Word (.docx)", onPress: () => go("docx") },
    { text: "PDF", onPress: () => go("pdf") },
    { text: "Cancel", style: "cancel" },
  ]);
}
