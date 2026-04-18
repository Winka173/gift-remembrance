import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { compressImage, saveToAppDir, deleteFromAppDir } from '@/utils/photoUtils';

export function usePhotoAttach() {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const saveFrom = useCallback(async (srcUri: string) => {
    setLoading(true);
    try {
      const compressed = await compressImage(srcUri);
      const saved = await saveToAppDir(compressed, 'photos');
      setUri(saved);
    } finally {
      setLoading(false);
    }
  }, []);

  const pick = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    await saveFrom(result.assets[0].uri);
  }, [saveFrom]);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    await saveFrom(result.assets[0].uri);
  }, [saveFrom]);

  const remove = useCallback(async (existingUri: string | null) => {
    if (existingUri) await deleteFromAppDir(existingUri).catch(() => {});
    setUri(null);
  }, []);

  return { uri, loading, pick, takePhoto, remove };
}
