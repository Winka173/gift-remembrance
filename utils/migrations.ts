import { MMKV } from 'react-native-mmkv';
import { mmkv } from './storage';
import { CURRENT_SCHEMA_VERSION } from '@/constants/config';

type MigrationFn = (db: MMKV) => void;

const MIGRATIONS: Record<number, MigrationFn> = {
  2: (db) => {
    const giftsRaw = db.getString('gifts');
    if (giftsRaw) {
      const state = JSON.parse(giftsRaw);
      for (const id of state.allIds ?? []) {
        const g = state.byId[id];
        if (g && 'personId' in g && !('personIds' in g)) {
          g.personIds = [g.personId];
          delete g.personId;
        }
        if (g && 'currency' in g) delete g.currency;
      }
      db.set('gifts', JSON.stringify(state));
    }

    const occasionsRaw = db.getString('occasions');
    if (occasionsRaw) {
      const state = JSON.parse(occasionsRaw);
      for (const id of state.allIds ?? []) {
        const o = state.byId[id];
        if (o && 'personId' in o && !('personIds' in o)) {
          o.personIds = [o.personId];
          delete o.personId;
        }
      }
      db.set('occasions', JSON.stringify(state));
    }

    const settingsRaw = db.getString('settings');
    if (settingsRaw) {
      const s = JSON.parse(settingsRaw);
      if (!('currencyLocked' in s)) s.currencyLocked = true;
      if (!('safFolderUri' in s)) s.safFolderUri = null;
      if (!('lastAutoBackupAt' in s)) s.lastAutoBackupAt = null;
      if (!('lastCloudBackupAt' in s)) s.lastCloudBackupAt = s.lastBackupAt ?? null;
      delete s.lastBackupAt;
      if (s.backupDestination === 'google_drive') s.backupDestination = 'saf';
      db.set('settings', JSON.stringify(s));
    }
  },
};

export function runMigrationsIfNeeded(): void {
  const current = mmkv.getNumber('schema_version') ?? 0;
  for (let v = current + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    MIGRATIONS[v]?.(mmkv);
    mmkv.set('schema_version', v);
  }
}
