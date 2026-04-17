export const CURRENT_SCHEMA_VERSION = 2;
export const BACKUP_FORMAT_VERSION = 2;

export const APP_CONFIG = {
  maxPeoplePerUser: 500,
  maxOccasionsPerPerson: 20,
  maxGiftsPerOccasion: 100,
  maxPhotosPerGift: 5,
  maxPhotoSizeMb: 10,
  maxBackupSizeMb: 50,
} as const;

export const RATE_LIMIT = {
  addPersonPerDay: 20,
  addGiftPerDay: 100,
  backupPerDay: 5,
} as const;

export const AD_UNIT_IDS = {
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
} as const;

export const NOTIFICATION_CONFIG = {
  defaultAdvanceDays: [1, 7],
  maxAdvanceDays: 30,
  channelId: 'gift-reminders',
  channelName: 'Gift Reminders',
} as const;

export const PHOTO_DIRS = {
  gifts: 'gift-photos',
  thumbnails: 'gift-thumbnails',
} as const;
