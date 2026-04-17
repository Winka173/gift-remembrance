import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { rescheduleAllOccasionsThunk } from '@/store/thunks/rescheduleAllOccasionsThunk';
import { requestPermissionIfNeeded } from '@/utils/notificationUtils';
import { updateSettings } from '@/store/slices/settingsSlice';

export function useNotifications() {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector((s) => s.settings.notificationsEnabled);

  const enable = useCallback(async () => {
    const granted = await requestPermissionIfNeeded();
    if (granted) {
      dispatch(updateSettings({ notificationsEnabled: true }));
      dispatch(rescheduleAllOccasionsThunk());
    }
    return granted;
  }, [dispatch]);

  const disable = useCallback(() => {
    dispatch(updateSettings({ notificationsEnabled: false }));
  }, [dispatch]);

  return { enabled, enable, disable };
}
