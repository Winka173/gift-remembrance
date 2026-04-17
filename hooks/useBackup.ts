import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { backupThunk } from '@/store/thunks/backupThunk';
import { restoreThunk } from '@/store/thunks/restoreThunk';
import * as DocumentPicker from '@react-native-documents/picker';

export function useBackup() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(backupThunk());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backup failed');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const restore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await DocumentPicker.pick({ type: ['*/*'] });
      if (!result[0]?.uri) return;
      await dispatch(restoreThunk(result[0].uri));
    } catch (e) {
      if (!DocumentPicker.isErrorWithCode(e)) {
        setError(e instanceof Error ? e.message : 'Restore failed');
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return { loading, error, backup, restore };
}
