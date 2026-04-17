import { Platform } from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker';
import * as FileSystem from 'expo-file-system/legacy';

export async function pickBackupFolder(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  try {
    const result = await DocumentPicker.pickDirectory();
    if (!result?.uri) return null;
    return result.uri;
  } catch {
    return null;
  }
}

export async function writeFileToSafFolder(
  folderUri: string,
  fileName: string,
  sourcePath: string,
): Promise<void> {
  if (Platform.OS !== 'android') return;
  const destUri = `${folderUri}/${encodeURIComponent(fileName)}`;
  await FileSystem.copyAsync({ from: sourcePath, to: destUri });
}

export async function listFilesInSafFolder(folderUri: string): Promise<string[]> {
  if (Platform.OS !== 'android') return [];
  try {
    return await FileSystem.readDirectoryAsync(folderUri);
  } catch {
    return [];
  }
}
