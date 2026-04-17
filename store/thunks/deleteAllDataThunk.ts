import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';
import { clearPeople } from '@/store/slices/peopleSlice';
import { clearGifts } from '@/store/slices/giftsSlice';
import { clearOccasions } from '@/store/slices/occasionsSlice';
import { resetSettings } from '@/store/slices/settingsSlice';

export const deleteAllDataThunk = createAsyncThunk(
  'settings/deleteAllData',
  async (_, { dispatch }) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    dispatch(clearPeople());
    dispatch(clearGifts());
    dispatch(clearOccasions());
    dispatch(resetSettings());
  },
);
