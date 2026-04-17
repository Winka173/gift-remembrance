import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { compressImage, saveToAppDir, deleteFromAppDir } from '@/utils/photoUtils';

export function usePhotoAttach() {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    setLoading(true);
    try {
      const compressed = await compressImage(result.assets[0].uri);
      const saved = await saveToAppDir(compressed, 'photos');
      setUri(saved);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (existingUri: string | null) => {
    if (existingUri) await deleteFromAppDir(existingUri).catch(() => {});
    setUri(null);
  }, []);

  return { uri, loading, pick, remove };
}
