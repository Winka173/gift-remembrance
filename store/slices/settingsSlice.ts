import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SettingsState } from '@/types/settings';
import { saveSlice, loadSlice } from '@/utils/storage';

const defaultSettings: SettingsState = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  currencyLocked: true,
  reminderDaysBefore: 7,
  reminderTimeOfDay: '09:00',
  backupDestination: 'none',
  safFolderUri: null,
  lastAutoBackupAt: null,
  lastCloudBackupAt: null,
  notificationsEnabled: true,
  hasSeenOnboarding: false,
  hasRequestedNotificationPermission: false,
  hasRequestedContactsPermission: false,
  hasRequestedTrackingAuth: false,
  biometricLockEnabled: false,
  biometricLockOnLaunch: false,
};

const initialState: SettingsState = loadSlice<SettingsState>('settings', defaultSettings);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      Object.assign(state, action.payload);
      saveSlice('settings', state);
    },
    resetSettings(state) {
      Object.assign(state, defaultSettings);
      saveSlice('settings', state);
    },
  },
});

export const { updateSettings, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
