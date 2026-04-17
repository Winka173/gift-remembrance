import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { runAutoBackupIfDue } from '@/utils/backupUtils';
import { updateSettings } from '@/store/slices/settingsSlice';

export const autoBackupThunk = createAsyncThunk(
  'settings/autoBackup',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    await runAutoBackupIfDue(state, state.settings);
    dispatch(updateSettings({ lastAutoBackupAt: Date.now() }));
  },
);
