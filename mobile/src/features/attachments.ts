import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { ACCEPTED_MIME_TYPES, MAX_FILE_BYTES, isAcceptedMimeType } from "@/lib/assistant";

/**
 * Picking a file for Shisho. Uses the system document picker, so the app needs
 * no storage or photo permission; the person chooses exactly one file and the
 * app reads only that. Types and the 15 MB limit are the website's own
 * (lib/assistant.ts), so the server never sees something it will reject.
 */

export type Attachment = { filename: string; mimeType: string; dataBase64: string; size: number };

export type PickResult =
  | { kind: "ok"; attachment: Attachment }
  | { kind: "cancelled" }
  | { kind: "error"; message: string };

const BY_EXTENSION: Record<string, string> = {
  txt: "text/plain",
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** Reads any URI React Native's networking layer can open (file://, content://, blob:). */
async function readViaFetch(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Three ways to read the picked file, in order. An installed build succeeds on
 * the first. Inside Expo Go the picker copies the file into Expo Go's own
 * cache, which its sandboxed file API is not allowed to read ("Missing READ
 * permission"), so the networking-layer read is the one that works there.
 */
async function readBase64(uri: string): Promise<string> {
  if (Platform.OS === "web") return readViaFetch(uri);
  try {
    return await new File(uri).base64();
  } catch (first) {
    if (__DEV__) console.warn("[attach] File.base64 failed:", first);
  }
  try {
    return await LegacyFileSystem.readAsStringAsync(uri, { encoding: LegacyFileSystem.EncodingType.Base64 });
  } catch (second) {
    if (__DEV__) console.warn("[attach] legacy read failed:", second);
  }
  return readViaFetch(uri);
}

export const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export async function pickAttachment(): Promise<PickResult> {
  let result: DocumentPicker.DocumentPickerResult;
  try {
    result = await DocumentPicker.getDocumentAsync({
      type: [...ACCEPTED_MIME_TYPES],
      copyToCacheDirectory: true,
      multiple: false,
    });
  } catch {
    return { kind: "error", message: "The file picker could not open." };
  }
  if (result.canceled || !result.assets?.[0]) return { kind: "cancelled" };

  const asset = result.assets[0];
  const ext = asset.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = asset.mimeType && isAcceptedMimeType(asset.mimeType) ? asset.mimeType : BY_EXTENSION[ext];
  if (!mimeType || !isAcceptedMimeType(mimeType)) {
    return { kind: "error", message: "Shisho reads PDF, Word (.docx), plain text and image files." };
  }
  if (asset.size != null && asset.size > MAX_FILE_BYTES) {
    return { kind: "error", message: `That file is ${formatSize(asset.size)}. The limit is ${formatSize(MAX_FILE_BYTES)}.` };
  }

  try {
    const dataBase64 = await readBase64(asset.uri);
    const size = asset.size ?? Math.floor((dataBase64.length * 3) / 4);
    if (size > MAX_FILE_BYTES) {
      return { kind: "error", message: `That file is ${formatSize(size)}. The limit is ${formatSize(MAX_FILE_BYTES)}.` };
    }
    return { kind: "ok", attachment: { filename: asset.name, mimeType, dataBase64, size } };
  } catch (e) {
    if (__DEV__) console.warn("[attach] could not read the picked file:", e);
    return { kind: "error", message: "That file could not be read. Try another copy of it." };
  }
}
