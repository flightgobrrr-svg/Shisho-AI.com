/**
 * Shared types/constants for the Drive-template feature, split out from
 * lib/googleDrive.ts specifically so a "use client" file can import the one
 * genuine VALUE it needs — DRIVE_TEMPLATE_MIME_TYPES, to filter Google
 * Picker's own view — without pulling in googleapis/google-auth-library,
 * which depend on Node built-ins (fs, child_process) that don't exist in a
 * browser bundle and broke /draft-bot outright the one time this was a
 * value import from lib/googleDrive.ts instead of from here.
 *
 * Every OTHER file that references DriveTemplateFile does so with
 * `import type`, which is erased at compile time and was never actually a
 * bundling risk — this file exists only because DRIVE_TEMPLATE_MIME_TYPES
 * itself is a real runtime value, not a type.
 */

export const DRIVE_TEMPLATE_MIME_TYPES = [
  "application/vnd.google-apps.document",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type DriveTemplateMimeType = (typeof DRIVE_TEMPLATE_MIME_TYPES)[number];

export type DriveTemplateFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
};
