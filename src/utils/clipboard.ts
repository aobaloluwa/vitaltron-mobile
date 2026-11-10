import { Clipboard, Platform } from 'react-native';

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    Clipboard.setString(text);
    return true;
  } catch {
    try {
      Clipboard.setString(text);
      return true;
    } catch {
      return false;
    }
  }
}
