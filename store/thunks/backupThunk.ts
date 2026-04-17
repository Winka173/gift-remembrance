import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { createBackupZip, writeToDestination } from '@/utils/backupUtils';
import { updateSettings } from '@/store/slices/settingsSlice';

export const backupThunk = createAsyncThunk(
  'settings/backup',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const zipPath = await createBackupZip(state);
    await writeToDestination(zipPath, state.settings);
    dispatch(updateSettings({ lastCloudBackupAt: Date.now() }));
    return zipPath;
  },
);
