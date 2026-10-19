import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";

export const copyText = (text: string) => Clipboard.setStringAsync(text);

/** Opens the system share sheet. On a platform without one it quietly does nothing; copying still works. */
export async function shareText(text: string) {
  try {
    await Share.share({ message: text });
  } catch {
    /* the user closed the sheet, or sharing is unavailable */
  }
}
