import type { CurrencyCode } from '@/constants/currencies';
import type { BackupDestination } from './backup';
import type { ReminderDays } from './occasion';

export type LanguageCode = 'en' | 'es' | 'zh' | 'ja' | 'vi' | 'id' | 'fr' | 'de' | 'pt' | 'ar' | 'hi';

export interface SettingsState {
  notificationsEnabled: boolean;
  reminderDaysBefore: ReminderDays;
  reminderTimeOfDay: string;
  currency: CurrencyCode;
  currencyLocked: boolean;
  language: LanguageCode;
  theme: 'light' | 'dark' | 'system';
  backupDestination: BackupDestination;
  safFolderUri: string | null;
  lastAutoBackupAt: number | null;
  lastCloudBackupAt: number | null;
  hasSeenOnboarding: boolean;
  hasRequestedNotificationPermission: boolean;
  hasRequestedContactsPermission: boolean;
  hasRequestedTrackingAuth: boolean;
}
