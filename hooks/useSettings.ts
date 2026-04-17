import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateSettings, resetSettings } from '@/store/slices/settingsSlice';
import type { SettingsState } from '@/types/settings';

export function useSettings() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.settings);

  return {
    settings,
    updateSettings: (changes: Partial<SettingsState>) => dispatch(updateSettings(changes)),
    resetSettings: () => dispatch(resetSettings()),
  };
}
