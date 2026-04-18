import * as FileSystem from 'expo-file-system/legacy';
import { zip, unzip } from 'react-native-zip-archive';
import { format } from 'date-fns';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { BackupManifest } from '@/types/backup';
import type { SettingsState } from '@/types/settings';
import type { RootState } from '@/types/store';
import { BACKUP_FORMAT_VERSION, APP_CONFIG } from '@/constants/config';
import { writeFileToSafFolder } from './safUtils';

const BASE = FileSystem.documentDirectory ?? '';
const BACKUPS_DIR = `${BASE}backups/`;

export async function createBackupZip(state: RootState): Promise<string> {
  const tmp = `${BASE}backup_tmp_${Date.now()}/`;
  await FileSystem.makeDirectoryAsync(`${tmp}photos`, { intermediates: true });
  await FileSystem.makeDirectoryAsync(`${tmp}avatars`, { intermediates: true });

  const people = state.people.allIds.map((id) => state.people.byId[id]);
  const gifts = state.gifts.allIds.map((id) => state.gifts.byId[id]);
  const occasions = state.occasions.allIds.map((id) => state.occasions.byId[id]);

  const manifestGifts = await Promise.all(
    gifts.map(async (g) => {
      if (g.photoUri) {
        await FileSystem.copyAsync({ from: g.photoUri, to: `${tmp}photos/${g.id}.jpg` }).catch(() => {});
      }
      return { ...g, photoUri: null };
    }),
  );

  const manifestPeople = await Promise.all(
    people.map(async (p) => {
      if (p.avatarUri) {
        await FileSystem.copyAsync({ from: p.avatarUri, to: `${tmp}avatars/${p.id}.jpg` }).catch(() => {});
      }
      return { ...p, avatarUri: null };
    }),
  );

  const manifest: BackupManifest = {
    version: BACKUP_FORMAT_VERSION as 2,
    createdAt: Date.now(),
    appVersion: Constants.expoConfig?.version ?? '1.0.0',
    deviceOs: Platform.OS as 'ios' | 'android',
    data: { people: manifestPeople, gifts: manifestGifts, occasions, settings: state.settings },
  };

  await FileSystem.writeAsStringAsync(`${tmp}manifest.json`, JSON.stringify(manifest));
  await FileSystem.makeDirectoryAsync(BACKUPS_DIR, { intermediates: true });

  const zipPath = `${BACKUPS_DIR}backup-${Date.now()}.gftrmb.zip`;
  await zip(tmp.replace(/\/$/, ''), zipPath);
  await FileSystem.deleteAsync(tmp, { idempotent: true });

  return zipPath;
}

export async function unzipAndValidate(
  zipPath: string,
): Promise<{ manifest: BackupManifest; tempDir: string }> {
  const tmpDir = `${BASE}restore_tmp_${Date.now()}/`;
  await unzip(zipPath, tmpDir);
  const raw = await FileSystem.readAsStringAsync(`${tmpDir}manifest.json`);
  const parsed = JSON.parse(raw);
  if (!validateManifest(parsed)) {
    await FileSystem.deleteAsync(tmpDir, { idempotent: true });
    throw new Error('Invalid or unsupported backup format');
  }
  return { manifest: parsed as BackupManifest, tempDir: tmpDir };
}

export function validateManifest(m: unknown): m is BackupManifest {
  if (typeof m !== 'object' || m === null) return false;
  const obj = m as Record<string, unknown>;
  if (obj.version !== 2) return false;
  if (typeof obj.createdAt !== 'number') return false;
  if (!obj.data || typeof obj.data !== 'object') return false;
  return true;
}

export async function applyManifest(
  manifest: BackupManifest,
  tempDir: string,
): Promise<void> {
  await FileSystem.makeDirectoryAsync(`${BASE}photos`, { intermediates: true });
  await FileSystem.makeDirectoryAsync(`${BASE}avatars`, { intermediates: true });

  for (const gift of manifest.data.gifts) {
    const src = `${tempDir}photos/${gift.id}.jpg`;
    const info = await FileSystem.getInfoAsync(src);
    if (info.exists) {
      await FileSystem.copyAsync({ from: src, to: `${BASE}photos/${gift.id}.jpg` });
    }
  }

  for (const person of manifest.data.people) {
    const src = `${tempDir}avatars/${person.id}.jpg`;
    const info = await FileSystem.getInfoAsync(src);
    if (info.exists) {
      await FileSystem.copyAsync({ from: src, to: `${BASE}avatars/${person.id}.jpg` });
    }
  }

  await FileSystem.deleteAsync(tempDir, { idempotent: true });
}

export async function runAutoBackupIfDue(
  state: RootState,
  settings: SettingsState,
): Promise<void> {
  const now = Date.now();
  if (now - (settings.lastAutoBackupAt ?? 0) < APP_CONFIG.AUTO_BACKUP_INTERVAL_MS) return;

  try {
    const zipPath = await createBackupZip(state);
    const dateStr = format(new Date(now), 'yyyy-MM-dd');
    const autoPath = `${BACKUPS_DIR}auto-${dateStr}.gftrmb.zip`;
    await FileSystem.copyAsync({ from: zipPath, to: autoPath });
    await FileSystem.deleteAsync(zipPath, { idempotent: true });

    const files = await FileSystem.readDirectoryAsync(BACKUPS_DIR);
    const autoFiles = files
      .filter((f) => f.startsWith('auto-') && f.endsWith('.gftrmb.zip'))
      .sort()
      .reverse();
    for (const f of autoFiles.slice(APP_CONFIG.AUTO_BACKUP_RETAIN_COUNT)) {
      await FileSystem.deleteAsync(`${BACKUPS_DIR}${f}`, { idempotent: true });
    }
  } catch (e) {
    console.warn('[backupUtils] Auto backup failed:', e);
  }
}

export type WriteDestinationStatus = 'ok' | 'none' | 'icloud_unavailable' | 'saf_not_set' | 'error';

export async function writeToDestination(
  zipPath: string,
  settings: SettingsState,
): Promise<WriteDestinationStatus> {
  if (settings.backupDestination === 'none') return 'none';

  if (settings.backupDestination === 'icloud' && Platform.OS === 'ios') {
    try {
      const icloudBase = FileSystem.documentDirectory?.replace(
        '/Documents/',
        '/Library/Mobile Documents/iCloud~com~giftremembrance~app/Documents/',
      );
      if (!icloudBase) return 'icloud_unavailable';
      await FileSystem.makeDirectoryAsync(icloudBase, { intermediates: true });
      const fileName = zipPath.split('/').pop() ?? 'backup.gftrmb.zip';
      await FileSystem.copyAsync({ from: zipPath, to: `${icloudBase}${fileName}` });
      return 'ok';
    } catch {
      return 'icloud_unavailable';
    }
  }

  if (settings.backupDestination === 'saf' && Platform.OS === 'android') {
    if (!settings.safFolderUri) return 'saf_not_set';
    try {
      const fileName = zipPath.split('/').pop() ?? 'backup.gftrmb.zip';
      await writeFileToSafFolder(settings.safFolderUri, fileName, zipPath);
      return 'ok';
    } catch {
      return 'error';
    }
  }

  return 'none';
}
