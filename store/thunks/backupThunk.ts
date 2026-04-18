import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { createBackupZip, writeToDestination, type WriteDestinationStatus } from '@/utils/backupUtils';
import { updateSettings } from '@/store/slices/settingsSlice';

export const backupThunk = createAsyncThunk<
  { zipPath: string; destinationStatus: WriteDestinationStatus }
>(
  'settings/backup',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const zipPath = await createBackupZip(state);
    const destinationStatus = await writeToDestination(zipPath, state.settings);
    if (destinationStatus === 'ok') {
      dispatch(updateSettings({ lastCloudBackupAt: Date.now() }));
    }
    return { zipPath, destinationStatus };
  },
);
