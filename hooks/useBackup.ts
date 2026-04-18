import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from '@react-native-documents/picker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { backupThunk } from '@/store/thunks/backupThunk';
import { restoreThunk, type RestoreMode } from '@/store/thunks/restoreThunk';
import { createBackupZip } from '@/utils/backupUtils';
import type { RootState } from '@/types/store';

export function useBackup() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s) as RootState;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(backupThunk()).unwrap();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backup failed');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const exportShare = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const zipPath = await createBackupZip(state);
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setError('Sharing is not available on this device');
        return;
      }
      await Sharing.shareAsync(zipPath, {
        mimeType: 'application/zip',
        dialogTitle: 'Export Gift Remembrance backup',
        UTI: 'public.zip-archive',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }, [state]);

  const restore = useCallback(
    async (mode?: RestoreMode) => {
      setLoading(true);
      setError(null);
      try {
        const result = await DocumentPicker.pick({ type: ['*/*'] });
        if (!result[0]?.uri) return;
        const zipPath = result[0].uri;

        const chosenMode: RestoreMode = await new Promise((resolve) => {
          if (mode) {
            resolve(mode);
            return;
          }
          Alert.alert(
            'Restore Backup',
            'Replace your current data or merge with existing?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve('replace' as RestoreMode) },
              { text: 'Merge', onPress: () => resolve('merge') },
              { text: 'Replace', style: 'destructive', onPress: () => resolve('replace') },
            ],
          );
        });

        await dispatch(restoreThunk({ zipPath, mode: chosenMode })).unwrap();
      } catch (e) {
        if (!DocumentPicker.isErrorWithCode(e)) {
          setError(e instanceof Error ? e.message : 'Restore failed');
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch, state],
  );

  return { loading, error, backup, exportShare, restore };
}
