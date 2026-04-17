import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Crypto from 'expo-crypto';
import { APP_CONFIG } from '@/constants/config';

const BASE_DIR = FileSystem.documentDirectory ?? '';

export async function ensureDir(subdir: string): Promise<void> {
  const path = `${BASE_DIR}${subdir}`;
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: APP_CONFIG.MAX_PHOTO_WIDTH } }],
    {
      compress: APP_CONFIG.PHOTO_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  return result.uri;
}

export async function saveToAppDir(
  srcUri: string,
  subdir: 'avatars' | 'photos',
  id?: string,
): Promise<string> {
  await ensureDir(subdir);
  const fileId = id ?? (await Crypto.randomUUID());
  const dest = `${BASE_DIR}${subdir}/${fileId}.jpg`;
  const compressed = await compressImage(srcUri);
  await FileSystem.copyAsync({ from: compressed, to: dest });
  return dest;
}

export async function deleteFromAppDir(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (e) {
    console.warn('[photoUtils] Failed to delete file:', uri, e);
  }
}
